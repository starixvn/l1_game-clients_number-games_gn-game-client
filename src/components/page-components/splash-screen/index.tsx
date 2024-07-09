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
    const { gameId, isDirectMode, token, language, firstSSOToLobby } = useContext(URLContext);
    const latestGameId = StorageHelper.get<number>(localStorageKeys.latestGameId) || 0;
    globalThis.startSplashScreenTime = Date.now();
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
            const session = await getSession(token);
            const lang = await loadLanguage(session);

            if (!session || isTimeoutSession(session)) {
                signOut();
                return;
            }

            if (session?.isUM) {
                handleUM(session);
                return;
            }

            setCurrentSession(session);
            authorizeInfo = await authorize(session);

            if (authorizeInfo.errorCode === "SB0002") {
                signOut();
                return;
            }

            if (!authorizeInfo?.authorized && isDirectMode) {
                authorizeInfo = await autoCreateNickname(session, signOut);
            }

            if (!authorizeInfo?.authorized) {
                setIsRenderRegister(true);
                return;
            }

            const lobbyConfigs = await loadLobbyConfigs(session, authorizeInfo);

            let toLoadGameId = gameId;
            if (!isDirectMode) {
                toLoadGameId = await getSSORedirectToGameId(lobbyConfigs, authorizeInfo);
            }
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
        if (!lobbyConfigs || !authorizeInfo) {
            return;
        }
        let toLoadGameId = latestGameId;
        if (firstSSOToLobby) {
            const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs, authorizeInfo);
            if (enabledRenderGameSettings.length > 0) {
                let isFoundToLoadGame = false;
                toLoadGameId !== 0 && (isFoundToLoadGame = await isFoundToLoadGameId(enabledRenderGameSettings, toLoadGameId));

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
        return <UMPage />;
    }

    if (isRenderDashboard) {
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
        return <Register session={currentSession} isUm={isUm} isDirectMode={isDirectMode} gameId={gameId} />;
    }

    return (
        <>
            <div className={`${Styles.page}`}>
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo.png?v=${buildVersion}`}
                            width={195}
                            height={162}
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
