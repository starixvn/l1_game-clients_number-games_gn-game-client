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
    const { gameId, isDirectMode, token, language, firstSSOToLobby, isSabaPlay } = useContext(URLContext);
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
        router.push("timeout");
    };

    const handleUM = (session: SSOResponse) => {
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
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            return null;
        }
        if (lobby?.lobbyConfigs) {
            setLobbyConfigs(lobby.lobbyConfigs);
            handleBannerOffer(authorizeInfo, lobby.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
        }
        return lobby?.lobbyConfigs;
    };

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            console.log("[SplashScreen] handleInitialization - Starting initialization");
            console.log("[SplashScreen] handleInitialization - URL Context values:", { gameId, isDirectMode, token, language, firstSSOToLobby, isSabaPlay });

            const session = await getSession(token);
            console.log("[SplashScreen] handleInitialization - Session retrieved:", session);

            const lang = await loadLanguage(session);
            console.log("[SplashScreen] handleInitialization - Language loaded:", lang);

            if (!session || isTimeoutSession(session)) {
                console.log("[SplashScreen] handleInitialization - Session timeout, signing out");
                signOut();
                return;
            }

            if (session?.isUM) {
                console.log("[SplashScreen] handleInitialization - UM session detected, handling UM");
                handleUM(session);
                return;
            }

            setCurrentSession(session);
            authorizeInfo = await authorize(session);
            console.log("[SplashScreen] handleInitialization - Authorization result:", authorizeInfo);

            if (authorizeInfo.errorCode === "SB0002") {
                console.log("[SplashScreen] handleInitialization - Error code SB0002, signing out");
                signOut();
                return;
            }

            console.log("[SplashScreen] handleInitialization - Checking auto nickname creation conditions");
            console.log("[SplashScreen] handleInitialization - authorizeInfo?.authorized:", authorizeInfo?.authorized);
            console.log("[SplashScreen] handleInitialization - isSabaPlay:", isSabaPlay);
            console.log("[SplashScreen] handleInitialization - Condition: !authorizeInfo?.authorized && isSabaPlay =", !authorizeInfo?.authorized && isSabaPlay);

            if (!authorizeInfo?.authorized && isSabaPlay) {
                console.log("[SplashScreen] handleInitialization - Auto creating nickname for SabaPlay");
                authorizeInfo = await autoCreateNickname(session, signOut);
                console.log("[SplashScreen] handleInitialization - Auto nickname creation result:", authorizeInfo);
            }

            console.log("[SplashScreen] handleInitialization - Final authorization check:", authorizeInfo?.authorized);
            if (!authorizeInfo?.authorized && (isDirectMode || isSabaPlay)) {
                console.log("[SplashScreen] handleInitialization - User not authorized, rendering register page");
                setIsRenderRegister(true);
                return;
            }

            console.log("[SplashScreen] handleInitialization - User authorized, loading lobby configs");
            const lobbyConfigs = await loadLobbyConfigs(session, authorizeInfo);

            let toLoadGameId = gameId;
            console.log("[SplashScreen] handleInitialization - Initial toLoadGameId:", toLoadGameId);
            console.log("[SplashScreen] handleInitialization - isDirectMode:", isDirectMode);

            if (!isDirectMode) {
                console.log("[SplashScreen] handleInitialization - Not direct mode, getting SSO redirect gameId");
                toLoadGameId = await getSSORedirectToGameId(lobbyConfigs, authorizeInfo);
                console.log("[SplashScreen] handleInitialization - SSO redirect gameId result:", toLoadGameId);
            } else {
                console.log("[SplashScreen] handleInitialization - Direct mode, using URL gameId directly:", toLoadGameId);
                // Fix: If URL gameId is 0, use latestGameId as fallback for direct mode
                if (toLoadGameId === 0 && latestGameId > 0) {
                    console.log("[SplashScreen] handleInitialization - Direct mode with gameId 0, using latestGameId as fallback:", latestGameId);
                    toLoadGameId = latestGameId;
                }
            }

            setCurrentGameId(toLoadGameId);
            console.log("[SplashScreen] handleInitialization - Final toLoadGameId set:", toLoadGameId);

            if (authorizeInfo) {
                setAuthorizeResponse(authorizeInfo);

                try {
                    console.log("[SplashScreen] handleInitialization - Running custom startup");
                    await customStartup(session, lang, router, player, authorizeInfo);
                    setIsDoneLoadConfig(true);
                    console.log("[SplashScreen] handleInitialization - Custom startup completed, isDoneLoadConfig set to true");
                } catch (error) {
                    console.error("[SplashScreen] handleInitialization - Custom startup error:", error);
                    onStartupError(error);
                }
            }
        };

        handleInitialization();
    }, []);

    const getSSORedirectToGameId = async (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
        if (!lobbyConfigs || !authorizeInfo) {
            return 0;
        }
        let toLoadGameId = latestGameId;

        const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs, authorizeInfo);

        if (firstSSOToLobby && enabledRenderGameSettings.length > 0) {
            // Business requirement: Redirect to lobby instead of specific game
            toLoadGameId = 0;
        } else if (!firstSSOToLobby) {
            // Only check for available game service if not firstSSOToLobby
            if (toLoadGameId !== 0) {
                const isFoundToLoadGame = await isFoundToLoadGameId(enabledRenderGameSettings, toLoadGameId);

                if (!isFoundToLoadGame) {
                    for (const gameSetting of enabledRenderGameSettings) {
                        const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
                        if (isServiceAvailable) {
                            toLoadGameId = gameSetting.id;
                            break;
                        }
                    }
                }
            }
        }
        return toLoadGameId;
    };

    const isFoundToLoadGameId = async (enabledRenderGameSettings: GameSettings[], toLoadGameId: number) => {
        let isFoundToLoadGameId = false;
        const gameSetting = enabledRenderGameSettings.find((gameSetting) => gameSetting.id === toLoadGameId);
        if (gameSetting) {
            const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
            if (isServiceAvailable) {
                isFoundToLoadGameId = true;
            }
        }
        return isFoundToLoadGameId;
    };

    if (player?.session?.isUM || isUm) {
        console.log("[SplashScreen] render - Rendering UM page");
        return <UMPage data-testid="um-page" />;
    }

    if (isRenderDashboard) {
        console.log("[SplashScreen] render - Rendering Dashboard");
        document.body.classList.add("galaxy-bg");
        return (
            <Dashboard
                data-testid="dashboard-component"
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
        console.log("[SplashScreen] render - Rendering Register page");
        return <Register data-testid="register-component" session={currentSession} isUm={isUm} isDirectMode={isDirectMode} gameId={gameId} firstSSOToLobby={firstSSOToLobby} isSabaPlay={isSabaPlay} />;
    }

    console.log("[SplashScreen] render - Rendering SplashScreen loading state");
    console.log("[SplashScreen] render - State values:", { isRenderDashboard, isRenderRegister, isUm, isDoneLoadConfig, currentGameId });
    const logoProps = {
        postfix: isSabaPlay ? `-sabaplay` : ``,
        width: isSabaPlay ? 173 : 195,
        height: isSabaPlay ? 205 : 162,
    };
    return (
        <>
            <div className={`${Styles.page} ${isSabaPlay ? Styles.sabaPlayBg : ''}`} data-testid="splash-screen">
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo${logoProps.postfix}.png?v=${buildVersion}`}
                            width={logoProps.width}
                            height={logoProps.height}
                            alt="logo"
                            priority={true}
                        />
                        {isSabaPlay && locale && (
                            <>
                                <div className={Styles["slogan-image"]}>
                                    <Image
                                        src={`/static/images/splash-screen/slogan-sabaplay/slogan-sabaplay-${locale}.webp?v=${buildVersion}`}
                                        width={354}
                                        height={46}
                                        alt="slogan"
                                        priority={true}
                                    />
                                </div>
                                <div className={Styles["loading-bar-sabaplay"]}>
                                    <Image
                                        src={`/static/images/splash-screen/loading-bar-sabaplay.gif?v=${buildVersion}`}
                                        width={108}
                                        height={6}
                                        alt="loading"
                                        priority={true}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {!isSabaPlay && (
                        <div className={Styles["slogan"]} data-testid="splash-screen-slogan">{locale && t("SabaNumber.splashscreen_slogan")}</div>
                    )}
                </div>

                {!isSabaPlay && (
                    <div className={"loading"}>
                        <div className={"progress"}>
                            <div className={"progress-bar"} id="progress-bar" data-testid="progress-bar"></div>
                        </div>
                        <p className={"text-first-download"} data-testid="download-message">{locale && t("Common.message_download_first_visit")}</p>
                    </div>
                )}
            </div>

            {isDoneLoadConfig && currentGameId >= 0 && (
                <PreloadResources
                    data-testid="preload-resources"
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
