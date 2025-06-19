import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { Themes, buildVersion, languageMapper, locales } from "../../../_shared/constants";
import {
    AnalyticsHelper,
    StorageHelper,
    getEnabledRenderGameSettings,
    getServiceStatusIsAvailable,
    localStorageKeys,
    randomInteger,
} from "../../../_shared/helpers";
import PreloadResources, {
    DURATION_HOLD_SPLASH_SCREEN,
    getAndHandleGameOfferIds,
    getAndHandleBannerOffer as handleBannerOffer,
} from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { GameSettings } from "../../game-base/type";
import { MAX_AVATAR_ID } from "../dashboard/register/avatar-gallery";
import NameGenerator from "../dashboard/register/name-generator";
import { ILobbyConfigs } from "../dashboard/type";
import Styles from "./splash-screen.module.scss";

export type SplashScreenProps = WithRouterProps;
export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

const UMPage = dynamic(() => import("../um-page"));
const Register = dynamic(() => import("../dashboard/register/register"));
const Dashboard = dynamic(() => import("../dashboard"));

export const customStartup = async (
    session: SSOResponse,
    locale: string,
    router: NextRouter,
    player: PlayerContextModel,
    authorizeResponse: any
): Promise<void> => {
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    player.locale = locale;
    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (session?.isAuthenticated) {
        setSentryUser(session);
        player.session = session;
        player.authorizeInfo = authorizeResponse;
        AnalyticsHelper.setUser(session.username);
    }
};

export function onStartupError(error: Error): void {
    console.error(error);

    Sentry.captureException(error);

    globalThis.location.pathname = "timeout";
}

const isTimeoutSession = (session: SSOResponse) => {
    return !session || (!session?.isUM && !session?.isAuthenticated);
};

const getSession = async (token: string) => {
    return token ? sso(token, getAppSettings().appType) : verifySession();
};

const autoCreateNickname = async (session: SSOResponse, signOut: Function) => {
    const nickname = NameGenerator.generateName();
    const maxAvatarId = MAX_AVATAR_ID;
    const selectedAvatarId = randomInteger(1, maxAvatarId);
    const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;
    if (authorizeResponse?.authorized) {
        Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
        authorizeResponse.user.isSignedInSM = true;
        updateSignInSMStatus(session);
    } else {
        signOut?.();
    }

    return authorizeResponse;
};

const SplashScreen: React.FC = () => {
    const { gameId, isDirectMode, token, language, firstSSOToLobby, isThirdParty } = useContext(URLContext);
    const latestGameId = StorageHelper.get<number>(localStorageKeys.latestGameId) || 0;

    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    const [isUm, setIsUm] = useState(player?.session?.isUM);
    const [bannerId, setBannerId] = useState<number>(0);
    const [locale, setLocale] = useState<string>();
    const [currentSession, setCurrentSession] = useState<SSOResponse>();
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number>(-1);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);
    const [isRenderRegister, setIsRenderRegister] = useState<boolean>(false);
    const [isRenderDashboard, setIsRenderDashboard] = useState<boolean>(false);
    const [isDoneLoadConfig, setIsDoneLoadConfig] = useState<boolean>(false);

    const signOut = () => {
        console.log("[SplashScreen] signOut called - redirecting to timeout");
        router.push("timeout");
    };

    const handleUM = (session: SSOResponse) => {
        console.log("[SplashScreen] handleUM called - setting UM session");
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
        setIsUm(true);
    };

    const loadLanguage = async (session: SSOResponse) => {
        const lang = languageMapper[session?.language] || languageMapper[language] || locales.en;
        await tolgee.changeLanguage(lang);
        setLocale(lang);
        return lang;
    };

    const loadLobbyConfigs = async (session: SSOResponse, authorizeInfo: any) => {
        console.log("[SplashScreen] loadLobbyConfigs called");
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            console.log("[SplashScreen] No lobby configs found");
            return null;
        }
        if (lobby?.lobbyConfigs) {
            console.log("[SplashScreen] Setting lobby configs:", Object.keys(lobby.lobbyConfigs));
            setLobbyConfigs(lobby.lobbyConfigs);
            handleBannerOffer(authorizeInfo, lobby.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
        }
        return lobby?.lobbyConfigs;
    };

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            console.log("[SplashScreen] handleInitialization started");
            console.log("[SplashScreen] Initial gameId from URL:", gameId);
            console.log("[SplashScreen] isDirectMode:", isDirectMode);
            console.log("[SplashScreen] latestGameId from storage:", latestGameId);

            const session = await getSession(token);
            const lang = await loadLanguage(session);

            if (!session || isTimeoutSession(session)) {
                console.log("[SplashScreen] Session timeout or invalid - signing out");
                signOut();
                return;
            }

            if (session?.isUM) {
                console.log("[SplashScreen] UM session detected");
                handleUM(session);
                return;
            }

            setCurrentSession(session);
            authorizeInfo = await authorize(session);

            if (authorizeInfo.errorCode === "SB0002") {
                console.log("[SplashScreen] Authorization error SB0002 - signing out");
                signOut();
                return;
            }

            if (!authorizeInfo?.authorized && isDirectMode) {
                console.log("[SplashScreen] Not authorized in direct mode - auto creating nickname");
                authorizeInfo = await autoCreateNickname(session, signOut);
            }

            if (!authorizeInfo?.authorized) {
                console.log("[SplashScreen] Not authorized - rendering register");
                setIsRenderRegister(true);
                return;
            }

            const lobbyConfigs = await loadLobbyConfigs(session, authorizeInfo);

            let toLoadGameId = gameId;
            if (!isDirectMode) {
                console.log("[SplashScreen] Not direct mode - getting SSO redirect game ID");
                toLoadGameId = await getSSORedirectToGameId(lobbyConfigs, authorizeInfo);
            }
            console.log("[SplashScreen] Final toLoadGameId:", toLoadGameId);
            setCurrentGameId(toLoadGameId);

            if (authorizeInfo) {
                setAuthorizeResponse(authorizeInfo);

                try {
                    await customStartup(session, lang, router, player, authorizeInfo);
                    setIsDoneLoadConfig(true);
                } catch (error) {
                    onStartupError(error);
                }
            }
        };

        handleInitialization();
    }, []);

    const getSSORedirectToGameId = async (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
        console.log("[SplashScreen] getSSORedirectToGameId called");
        console.log("[SplashScreen] lobbyConfigs available:", !!lobbyConfigs);
        console.log("[SplashScreen] authorizeInfo available:", !!authorizeInfo);

        if (!lobbyConfigs || !authorizeInfo) {
            console.log("[SplashScreen] Missing lobbyConfigs or authorizeInfo - returning 0");
            return 0;
        }
        let toLoadGameId = latestGameId;
        console.log("[SplashScreen] Starting with latestGameId:", toLoadGameId);

        const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs, authorizeInfo);
        console.log("[SplashScreen] Enabled game settings count:", enabledRenderGameSettings.length);

        if (firstSSOToLobby && enabledRenderGameSettings.length > 0) {
            console.log("[SplashScreen] firstSSOToLobby is true - redirecting to lobby (gameId = 0)");
            // Business requirement: Redirect to lobby instead of specific game
            toLoadGameId = 0;
        } else if (!firstSSOToLobby) {
            console.log("[SplashScreen] firstSSOToLobby is false - using latestGameId");
            // Only check for available game service if not firstSSOToLobby
            if (toLoadGameId !== 0) {
                const isFoundToLoadGame = await isFoundToLoadGameId(enabledRenderGameSettings, toLoadGameId);
                console.log("[SplashScreen] isFoundToLoadGame:", isFoundToLoadGame);

                if (!isFoundToLoadGame) {
                    console.log("[SplashScreen] Game not found - searching for available service");
                    for (const gameSetting of enabledRenderGameSettings) {
                        const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
                        console.log("[SplashScreen] Checking game", gameSetting.id, "service available:", isServiceAvailable);
                        if (isServiceAvailable) {
                            toLoadGameId = gameSetting.id;
                            console.log("[SplashScreen] Found available game:", toLoadGameId);
                            break;
                        }
                    }
                }
            }
        }
        console.log("[SplashScreen] Final toLoadGameId from SSO redirect:", toLoadGameId);
        return toLoadGameId;
    };

    const isFoundToLoadGameId = async (enabledRenderGameSettings: GameSettings[], toLoadGameId: number) => {
        console.log("[SplashScreen] isFoundToLoadGameId checking for gameId:", toLoadGameId);
        let isFoundToLoadGameId = false;
        const gameSetting = enabledRenderGameSettings.find((gameSetting) => gameSetting.id === toLoadGameId);
        if (gameSetting) {
            console.log("[SplashScreen] Found game setting for ID:", toLoadGameId);
            const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
            console.log("[SplashScreen] Service available for game", toLoadGameId, ":", isServiceAvailable);
            if (isServiceAvailable) {
                isFoundToLoadGameId = true;
            }
        } else {
            console.log("[SplashScreen] Game setting not found for ID:", toLoadGameId);
        }
        return isFoundToLoadGameId;
    };

    if (player?.session?.isUM || isUm) {
        console.log("[SplashScreen] Rendering UM page");
        return <UMPage />;
    }

    if (isRenderDashboard) {
        console.log("[SplashScreen] Rendering Dashboard with gameId:", currentGameId < 0 ? gameId : currentGameId);
        document.body.classList.add("galaxy-bg");
        return (
            <Dashboard
                session={player?.session}
                queryGame={currentGameId < 0 ? gameId : currentGameId}
                setIsUm={setIsUm}
                directMode={isDirectMode}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
                lobbyConfigs={lobbyConfigs}
            />
        );
    }

    if (isRenderRegister) {
        console.log("[SplashScreen] Rendering Register with gameId:", gameId);
        return <Register session={currentSession} isUm={isUm} isDirectMode={isDirectMode} gameId={gameId} firstSSOToLobby={firstSSOToLobby} />;
    }

    const logoProps = {
        postfix: isThirdParty ? `-saba-play` : ``,
        width: isThirdParty ? 272 : 195,
        height: isThirdParty ? 100 : 162,
    };
    return (
        <>
            <div className={`${Styles.page}`}>
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo${logoProps.postfix}.png?v=${buildVersion}`}
                            width={logoProps.width}
                            height={logoProps.height}
                            alt="logo"
                            priority={true}
                        />
                    </div>

                    <div className={Styles["slogan"]}>{locale && t("SabaNumber.splashscreen_slogan")}</div>
                </div>

                <div className={"loading"}>
                    <div className={"progress"}>
                        <div className={"progress-bar"} id="progress-bar"></div>
                    </div>
                    <p className={"text-first-download"}>{locale && t("Common.message_download_first_visit")}</p>
                </div>
            </div>

            {isDoneLoadConfig && currentGameId >= 0 && (
                <PreloadResources
                    bannerId={bannerId}
                    setIsDonePreload={() => {
                        setIsRenderDashboard(true);
                    }}
                    gameId={currentGameId}
                    isDirectMode={isDirectMode}
                    locale={locale}
                    gameIdsIcon={gameOfferIds}
                    durationDelayDonePreload={DURATION_HOLD_SPLASH_SCREEN}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
