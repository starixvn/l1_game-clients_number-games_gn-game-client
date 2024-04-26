import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { LobbyResponse } from "sc-user-service-client/dist/lobby";
import { getAppSettings, getGameIdsSetting } from "../../../_shared/app-settings";
import { languageMapper } from "../../../_shared/constants";
import { AnalyticsHelper, StorageHelper, getLobbyGamesIds, localStorageKeys } from "../../../_shared/helpers";
import PreloadResources from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { getGameIdOfferBanner } from "../lobby/games/components/banner";
import UMPage from "../um-page";
import Styles from "./splash-screen.module.scss";

export type SplashScreenProps = WithRouterProps;

export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

export const customStartup = async (
    currentSession: SSOResponse,
    locale: string,
    router: NextRouter,
    player: PlayerContextModel
): Promise<void> => {
    const isTimeout = !currentSession || (!currentSession?.isUM && !currentSession?.isAuthenticated);
    await tolgee.changeLanguage(locale);

    player.locale = locale;
    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (currentSession?.isUM) {
        StorageHelper.set(localStorageKeys.umInfo, currentSession.umInfo);
        player.session = currentSession;
    }

    if (currentSession?.isAuthenticated) {
        setSentryUser(currentSession);
        player.session = currentSession;
        AnalyticsHelper.setUser(currentSession.username);
    }
};

export function onStartupError(error: Error): void {
    console.error(error);

    Sentry.captureException(error);

    globalThis.location.pathname = "timeout";
}

const SplashScreen: React.FC<{
    gameId: number;
    isDirectMode: boolean;
}> = ({ isDirectMode, gameId }) => {
    const { token, language } = useContext(URLContext);
    const router = useRouter();
    const player = usePlayerContext();
    const { session } = usePlayerContext();
    const { t } = useTranslator();

    const [isDonePreloadResources, setIsDonePreloadResources] = useState<boolean>(false);
    const [isDoneLoadLogo, setIsDoneLoadLogo] = useState<boolean>(false);
    const [bannerId, setBannerId] = useState<number>(0);
    const [currentLocale, setCurrentLocale] = useState<string>();
    const [currentSession, setCurrentSession] = useState<SSOResponse>();
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    useEffect(() => {
        const getBanners = async () => {
            const session = await (token ? sso(token, getAppSettings().appType) : verifySession());
            session && setCurrentSession(session);
            const locale = languageMapper[currentSession?.language] || languageMapper[language];
            locale && setCurrentLocale(locale);
            const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
            if (isTimeout) {
                router.push("timeout");
                return;
            }
            const authorizeInfo = (await authorize(session)) as AuthorizeResponse;

            if (authorizeInfo?.authorized) {
                const lobby: LobbyResponse = await getLobbyConfigs(session);
                if (lobby?.lobbyConfigs) {
                    const gameIdsOfferBanner = getGameIdOfferBanner(authorizeInfo, lobby?.lobbyConfigs);
                    gameIdsOfferBanner.length > 0 && setBannerId(gameIdsOfferBanner[0]);
                    const gameOfferIds = getLobbyGamesIds(lobby?.lobbyConfigs, authorizeInfo);
                    gameOfferIds.length > 0 && setGameOfferIds(gameOfferIds);
                }
            } else {
                // Hard code get first gameId on GameSetting
                const gameIds = getGameIdsSetting();
                const firstGameId = +gameIds[0];
                if (firstGameId > 0) {
                    setGameOfferIds([firstGameId]);
                    setBannerId(firstGameId);
                }
            }
        };
        getBanners();
    }, []);

    useEffect(() => {
        if (router?.isReady && isDonePreloadResources) {
            const handleStartup = async () => {
                try {
                    await customStartup(currentSession, currentLocale, router, player);
                    await router?.push("/", undefined, { shallow: true });
                } catch (error) {
                    onStartupError(error);
                }
            };
            handleStartup();
        }
    }, [isDonePreloadResources]);

    if (session?.isUM) {
        return <UMPage />;
    }

    return (
        <>
            <div className={`${Styles.page}`}>
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={"/static/images/splash-screen/2x/logo.png"}
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

            {isDoneLoadLogo && bannerId > 0 && !!currentLocale && (
                <PreloadResources
                    bannerId={bannerId}
                    setIsDonePreloadResource={setIsDonePreloadResources}
                    gameId={gameId}
                    isDirectMode={isDirectMode}
                    currentLocale={currentLocale}
                    gameIdsIcon={gameOfferIds}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
