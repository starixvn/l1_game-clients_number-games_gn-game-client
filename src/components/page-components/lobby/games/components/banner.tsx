import React, { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { getBannerIds, getBanners, getOfferGamesIds } from "../../../../../_shared/helpers";
import { usePlayerContext } from "../../../../../_shared/react-contexts";
import { tolgee } from "../../../../../_shared/tolgee";
import { BannerSwiper } from "../../../../game-components/banner-swiper/banner-swiper";
import { IBanner, ILobbyConfigs } from "../../../dashboard/type";

const DEFAULT_BANNER_PATH = "/static/images/lobby/banners";

export const Banner: React.FC<{ openGame: Function; lobbyConfigs: ILobbyConfigs }> = ({ openGame, lobbyConfigs }) => {
    const { authorizeInfo } = usePlayerContext();
    const locale = tolgee.getLanguage() ?? "en";
    const [filterBanners, setFilterBanners] = useState<IBanner[]>([]);
    const [banners, setBanners] = useState<IBanner[]>([]);

    const getGameIdOfferBanner = () => {
        const gameIds: number[] = [];
        const offerGamesIds = getOfferGamesIds(authorizeInfo);
        const bannerIds = getBannerIds(lobbyConfigs);
        bannerIds.forEach((id: number) => {
            if (offerGamesIds.includes(id)) {
                gameIds.push(id);
            }
        });

        return gameIds;
    };

    useEffect(() => {
        if (lobbyConfigs && authorizeInfo) {
            const gameIdsOfferBanner = getGameIdOfferBanner();
            if (gameIdsOfferBanner.length > 0) {
                const banners = getBanners(lobbyConfigs);

                const filterBanners = banners.filter((banner) => gameIdsOfferBanner.includes(banner.gameId));
                setFilterBanners(filterBanners);
            }
        }
    }, [lobbyConfigs, authorizeInfo]);

    useEffect(() => {
        if (filterBanners.length > 0) {
            updateBannersWithPath();
        }
    }, [filterBanners]);

    const updateBannersWithPath = async () => {
        const updatedBanners = [];
        for (const banner of filterBanners) {
            try {
                const validPath = await getImageValidPath(banner);
                if (validPath !== "") {
                    updatedBanners.push({ ...banner, path: validPath });
                }
            } catch (error) {
                console.log("Error get banner follow path", banner);
            }
        }

        setBanners(updatedBanners);
    };

    const getImageValidPath = async (banner: IBanner): Promise<string> => {
        const paths = [
            `${DEFAULT_BANNER_PATH}/${banner.gameId}/${banner.gameId}_${locale}.png`,
            `${DEFAULT_BANNER_PATH}/${banner.gameId}/${banner.gameId}_en.png`,
        ];
        let validPath = "";

        for (const path of paths) {
            try {
                const result = await createImagePromise(path);
                if (result.valid) {
                    validPath = result.path;
                    break;
                }
            } catch (error) {
                console.log("Error invalid path image:", path);
            }
        }

        return validPath;
    };

    const createImagePromise = (path: string): Promise<{ path: string; valid: boolean }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ path, valid: true });
            img.onerror = (event: Event | string) => {
                reject(event);
            };

            img.src = path;
        });
    };

    if (banners.length === 0) {
        return <></>;
    }

    return (
        <>
            <BannerSwiper banners={banners} openGame={openGame} />
        </>
    );
};
