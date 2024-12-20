import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { LobbyConfigs } from "sc-user-service-client/dist/lobby";
import { getGameIdOfferBanner } from "../../components/page-components/lobby/banners/banner";
import { getLobbyGamesIds } from "./lobby-helper";
import { getAppSettings } from "../app-settings";
import { downloadAndCacheImage } from "./image-cache-controller";

const DEFAULT_PROGRESS_BAR_ID = "progress-bar";
export const DURATION_HOLD_SPLASH_SCREEN = 1000;

export const getAndHandleBannerOffer = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    const gameIdsOfferBanner = getGameIdOfferBanner(authorizeInfo, lobbyConfigs);
    if (gameIdsOfferBanner.length > 0) {
        callbackFn(gameIdsOfferBanner[0]);
    }
};

export const getAndHandleGameOfferIds = (authorizeInfo: AuthorizeResponse, lobbyConfigs: LobbyConfigs, callbackFn: Function) => {
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs, authorizeInfo);
    if (gameOfferIds.length > 0) {
        callbackFn(gameOfferIds);
    }
};

export const updateProgressBar = (percentage: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
    const progressBars = document.querySelectorAll(`#${progressBarId}`);
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

const memoriedImages = ["/chips/gn/", "/countdown-timer/", "/lobby/", "/cage/", "/anim/ball-middle/", "/ball/"];

const PreloadResources: React.FC<{
    setIsDonePreload: Function;
    gameId: number;
    isDirectMode?: boolean;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    progressBarId?: string;
}> = ({ setIsDonePreload, gameId, bannerId, gameIdsIcon, locale = "en", cancelPreload, durationDelayDonePreload = 0, progressBarId }) => {
    const enablePreloadResource = getAppSettings().enablePreloadResource ?? true;
    const router = useRouter();

    const getImage = async (path: string, cb) => {
        try {
            await axios.get(path);
        } catch (err) {
            console.log(err);
        }
        cb && cb();
    };

    const fetchImages = async () => {
        try {
            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            });
            const imagesPath = (response?.data as string[]) || [];
            if (imagesPath.length > 0) {
                let loadedImages = 0;
                imagesPath.forEach((path) => {
                    const callBack = () => {
                        loadedImages++;
                        updateProgressBar(loadedImages, imagesPath.length, progressBarId);
                        checkFinish(loadedImages, imagesPath.length);
                    };
                    if (memoriedImages.some((pathFolder) => path.includes(pathFolder))) {
                        downloadAndCacheImage(path)
                            .then(callBack)
                            .catch((error) => {
                                console.error(error);
                                callBack();
                            });
                    } else {
                        getImage(path, callBack);
                    }
                });
            } else {
                setIsDonePreload();
            }
        } catch (error) {
            console.log("Error fetching images:", error);
            setIsDonePreload();
        }
    };

    const updateProgressBar = (loaded: number, total: number, progressBarId = DEFAULT_PROGRESS_BAR_ID) => {
        const percentage = (loaded / total) * 100;
        const progressBars = document.querySelectorAll(`#${progressBarId}`);
        progressBars.forEach((progressBar) => {
            if (progressBar instanceof HTMLElement) {
                progressBar.style.width = `${percentage}%`;
            }
        });
    };

    const checkFinish = (loaded: number, total: number) => {
        if (loaded === total) {
            setIsDonePreload && setIsDonePreload();
        }
    };

    useEffect(() => {
        if (router?.isReady) {
            if (enablePreloadResource && gameId >= 0) {
                fetchImages();
            }
        }
    }, [router?.isReady, gameId]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (cancelPreload) {
            setIsDonePreload && setIsDonePreload();
            timeout && clearTimeout(timeout);
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [cancelPreload]);

    const handleStateWithoutPreloadResource = () => {
        updateProgressBar(1, 1, progressBarId);
        setIsDonePreload && setIsDonePreload();
    };

    return useMemo(() => {
        if (!enablePreloadResource || gameId < 0) {
            handleStateWithoutPreloadResource();

            return <></>;
        }

        return null;
    }, [gameId]);
};

export default PreloadResources;
