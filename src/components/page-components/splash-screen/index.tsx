import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";
import { getAppSettings, getGameIdsSetting } from "../../../_shared/app-settings";
import { Themes, buildVersion, languageMapper } from "../../../_shared/constants";
import { AnalyticsHelper, StorageHelper, getLobbyGamesIds, localStorageKeys, randomInteger } from "../../../_shared/helpers";
import PreloadResources from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { MAX_AVATAR_ID } from "../dashboard/register/avatar-gallery";
import NameGenerator from "../dashboard/register/name-generator";
import { getGameIdOfferBanner } from "../lobby/games/components/banner";
import UMPage from "../um-page";
import Styles from "./splash-screen.module.scss";

export type SplashScreenProps = WithRouterProps;

export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

export const customStartup = async (
    session: SSOResponse,
    locale: string,
    router: NextRouter,
    player: PlayerContextModel
): Promise<void> => {
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    player.locale = locale;
    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (session?.isUM) {
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
    }

    if (session?.isAuthenticated) {
        setSentryUser(session);
        player.session = session;
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
    return languageMapper[session?.language] || languageMapper[language];
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

const SplashScreen: React.FC<{
    gameId: number;
    isDirectMode: boolean;
    setAuthorizeResponse: Function;
    setLobbyConfigs: Function;
}> = ({ isDirectMode, gameId, setAuthorizeResponse, setLobbyConfigs }) => {
    const { token, language } = useContext(URLContext);
    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    const [isDonePreloadResources, setIsDonePreloadResources] = useState<boolean>(false);
    const [isDoneLoadLogo, setIsDoneLoadLogo] = useState<boolean>(false);
    const [bannerId, setBannerId] = useState<number>(0);
    const [locale, setLocale] = useState<string>();
    const [currentSession, setCurrentSession] = useState<SSOResponse>();
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    useEffect(() => {
        const handleInitialization = async () => {
            let authorizeInfo;
            const session = await getSession(token);
            if (!session || isTimeoutSession(session)) {
                signOut();
                return;
            }

            setCurrentSession(session);
            setLocale(getLocaleFromSession(session, language));
            authorizeInfo = await authorize(session);
            if (authorizeInfo.errorCode === "SB0002") {
                signOut();
                return;
            }

            if (!authorizeInfo?.authorized && isDirectMode) {
                authorizeInfo = await autoCreateNickname(session, signOut);
            }

            if (!authorizeInfo?.authorized) {
                handleUnauthorizedAccess();
                return;
            }

            const lobby = await getLobbyConfigs(session);
            if (lobby?.lobbyConfigs) {
                setLobbyConfigs(lobby?.lobbyConfigs);
                handleBanner(authorizeInfo, lobby.lobbyConfigs);
                handleGameOfferIds(authorizeInfo, lobby.lobbyConfigs);
            }

            authorizeInfo && setAuthorizeResponse(authorizeInfo);
        };

        handleInitialization();
    }, []);

    const signOut = () => {
        router.push("timeout");
    };

    const handleUnauthorizedAccess = () => {
        const gameIds = getGameIdsSetting()?.map((id) => parseInt(id, 10));
        const firstGameId = gameIds[0];
        if (firstGameId > 0) {
            setGameOfferIds(gameIds);
            setBannerId(firstGameId);
        }
    };

    const handleBanner = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs) => {
        const gameIdsOfferBanner = getGameIdOfferBanner(authorizeInfo, lobbyConfigs);
        if (gameIdsOfferBanner.length > 0) {
            setBannerId(gameIdsOfferBanner[0]);
        }
    };

    const handleGameOfferIds = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs) => {
        const gameOfferIds = getLobbyGamesIds(lobbyConfigs, authorizeInfo);
        if (gameOfferIds.length > 0) {
            setGameOfferIds(gameOfferIds);
        }
    };

    useEffect(() => {
        if (router?.isReady && isDonePreloadResources) {
            const handleStartup = async () => {
                try {
                    await customStartup(currentSession, locale, router, player);
                    await router?.push("/", undefined, { shallow: true });
                } catch (error) {
                    onStartupError(error);
                }
            };
            handleStartup();
        }
    }, [isDonePreloadResources]);

    if (player?.session?.isUM) {
        return <UMPage />;
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

                    <div className={Styles["slogan"]}>{t("SabaNumber.splashscreen_slogan")}</div>
                </div>

                <div className={Styles["loading"]}>
                    <div className={Styles["progress"]}>
                        <div className={Styles["progress-bar"]} id="progress-bar"></div>
                    </div>
                    <p className={Styles["text-first-download"]}>{t("Common.message_download_first_visit")}</p>
                </div>
            </div>

            {isDoneLoadLogo && bannerId > 0 && !!locale && (
                <PreloadResources
                    bannerId={bannerId}
                    setIsDonePreloadResource={setIsDonePreloadResources}
                    gameId={gameId}
                    isDirectMode={isDirectMode}
                    locale={locale}
                    gameIdsIcon={gameOfferIds}
                    enablePreloadResource={getAppSettings()?.enablePreloadResource || true}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
