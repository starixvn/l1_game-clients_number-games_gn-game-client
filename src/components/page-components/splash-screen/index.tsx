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
    getAvailableGameSettings,
    getEnabledAvailableGameSettings,
    getLobbyGamesIds,
    getServiceStatus,
    localStorageKeys,
    randomInteger,
} from "../../../_shared/helpers";
import PreloadResources, {
    DURATION_HOLD_SPLASH_SCREEN,
    getAndHandleGameOfferIds,
    getAndHandleBannerOffer as handleBannerOffer,
    updateProgressBar,
} from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
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

const getLocaleFromSession = (session: SSOResponse, language: string) => {
    return languageMapper[session?.language] || languageMapper[language] || locales.en;
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

    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    const [isUm, setIsUm] = useState(player?.session?.isUM);
    const [isDonePreloadResources, setIsDonePreloadResources] = useState<boolean>(false);
    const [isDoneLoadLogo, setIsDoneLoadLogo] = useState<boolean>(false);
    const [bannerId, setBannerId] = useState<number>(0);
    const [locale, setLocale] = useState<string>();
    const [currentSession, setCurrentSession] = useState<SSOResponse>();
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number>(-1);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);
    const [isRenderRegister, setIsRenderRegister] = useState<boolean>(false);
    const [isRenderDashboard, setIsRenderDashboard] = useState<boolean>(false);

    const signOut = () => {
        router.push("timeout");
    };

    const handleUM = (session: SSOResponse) => {
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
        setIsUm(true);
    };

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            const session = await getSession(token);
            const lang = getLocaleFromSession(session, language);
            await tolgee.changeLanguage(lang);
            setLocale(lang);

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

            const lobby = await getLobbyConfigs(session);

            if (lobby?.lobbyConfigs) {
                setLobbyConfigs(lobby?.lobbyConfigs);
                handleBannerOffer(authorizeInfo, lobby.lobbyConfigs, setBannerId);
                getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);

                let toLoadGameId = gameId;
                if (!isDirectMode) {
                    toLoadGameId = latestGameId;

                    const gameOfferIds = getLobbyGamesIds(lobby.lobbyConfigs, authorizeInfo);
                    if (firstSSOToLobby && gameOfferIds.length > 0) {
                        const availableGameSetting = getAvailableGameSettings(lobby.lobbyConfigs, gameOfferIds);
                        const enabledGames = (authorizeInfo as AuthorizeResponse).user.enabledGames;
                        const enabledAvailableGameSettings = getEnabledAvailableGameSettings(availableGameSetting, enabledGames);

                        if (enabledAvailableGameSettings.length > 0) {
                            let isFoundToLoadGame = false;

                            if (toLoadGameId !== 0) {
                                const gameSetting = enabledAvailableGameSettings.find((gameSetting) => gameSetting.id == toLoadGameId);
                                const isServiceAvailable = await getServiceStatus(gameSetting);
                                if (isServiceAvailable) {
                                    isFoundToLoadGame = true;
                                }
                            }

                            if (!isFoundToLoadGame) {
                                for (const gameSetting of enabledAvailableGameSettings) {
                                    const isServiceAvailable = await getServiceStatus(gameSetting);
                                    if (isServiceAvailable) {
                                        toLoadGameId = gameSetting.id;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                setCurrentGameId(toLoadGameId);
            }

            authorizeInfo && setAuthorizeResponse(authorizeInfo);
        };

        handleInitialization();
    }, []);

    useEffect(() => {
        if (router?.isReady && isDonePreloadResources && authorizeResponse) {
            const handleStartup = async () => {
                try {
                    await customStartup(currentSession, locale, router, player, authorizeResponse);
                    setIsRenderDashboard(true);
                } catch (error) {
                    onStartupError(error);
                }
            };

            handleStartup();
        }
    }, [isDonePreloadResources, authorizeResponse]);

    useEffect(() => {
        if (player?.session?.isAuthenticated && !player?.session?.isUM) {
            updateProgressBar(100);
            setIsRenderDashboard(true);
        }
    }, [player?.session]);

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
                authorizeResponse={player?.authorizeInfo}
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
                            onLoad={() => {
                                setIsDoneLoadLogo(true);
                            }}
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

            {isDoneLoadLogo && !!locale && (
                <PreloadResources
                    bannerId={bannerId}
                    setIsDonePreload={setIsDonePreloadResources}
                    gameId={currentGameId}
                    isDirectMode={isDirectMode}
                    locale={locale}
                    gameIdsIcon={gameOfferIds}
                    enablePreload={getAppSettings()?.enablePreloadResource || true}
                    durationDelayDonePreload={DURATION_HOLD_SPLASH_SCREEN}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
