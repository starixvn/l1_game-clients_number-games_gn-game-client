import "swiper/css";
import "swiper/css/pagination";

import React, { useEffect, useState } from "react";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { Swiper, SwiperSlide } from "swiper/react";
import { v4 as uuidv4 } from "uuid";
import { getBannerIds, getBanners, getOfferGamesIds } from "../../../../_shared/helpers";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { tolgee } from "../../../../_shared/tolgee";
import { IBanner, ILobbyConfigs } from "../../dashboard/type";
import { LobbyImagesData } from "../games/components/lobby-constant";
import { BannerSwiper, DEFAULT_DELAY_SLIDER } from "./banner-swiper";
import { downloadAndCacheImage } from "../../../../_shared/helpers/image-cache-controller";

const DEFAULT_BANNER_PATH = "/static/images/lobby/banners";

export const getGameIdOfferBanner = (authorizeInfo: AuthorizeResponse, lobbyConfigs: ILobbyConfigs) => {
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

const DefaultBanner = () => {
    return (
        <Swiper
            slidesPerView={"auto"}
            spaceBetween={4}
            className="swiper-banner"
            autoplay={{
                delay: DEFAULT_DELAY_SLIDER,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            roundLengths={true}
        >
            <SwiperSlide key={uuidv4}>
                <img className="banner-img" src={LobbyImagesData["banner"]} alt={"banner-blur"} width={734} height={248} />
            </SwiperSlide>
        </Swiper>
    );
};

export const Banner: React.FC<{ openGame: Function; lobbyConfigs: ILobbyConfigs }> = ({ openGame, lobbyConfigs }) => {
    const { authorizeInfo } = usePlayerContext();
    const locale = tolgee.getLanguage() ?? "en";
    const [banners, setBanners] = useState<IBanner[]>([]);

    useEffect(() => {
        if (lobbyConfigs && authorizeInfo) {
            const gameIdsOfferBanner = getGameIdOfferBanner(authorizeInfo, lobbyConfigs);
            if (gameIdsOfferBanner.length > 0) {
                const banners = getBanners(lobbyConfigs);

                const filterBanners = banners.filter((banner) => gameIdsOfferBanner.includes(banner.gameId));
                updateBannersWithPath(filterBanners);
            }
        }
    }, [lobbyConfigs, authorizeInfo]);

    const updateBannersWithPath = async (filterBanners: IBanner[]) => {
        const updatedBanners = [];
        for (const banner of filterBanners) {
            try {
                const validPath = await getImageValidPath(banner);
                if (validPath !== "") {
                    updatedBanners.push({ ...banner, path: validPath });
                }
            } catch (error) {
            }
        }

        setBanners(updatedBanners);
    };

    const getImageValidPath = async (banner: IBanner): Promise<string> => {
        const paths = [
            `${DEFAULT_BANNER_PATH}/${banner.gameId}/${banner.gameId}_${locale}.gif`,
            `${DEFAULT_BANNER_PATH}/${banner.gameId}/${banner.gameId}_en.gif`,
        ];
        let validPath = "";

        for (const path of paths) {
            try {
                const result = await downloadAndCacheImage(path);
                if (result.valid) {
                    validPath = result.path;
                    break;
                }
            } catch (error) {
            }
        }

        return validPath;
    };

    if (banners.length === 0) {
        return <DefaultBanner />;
    }

    return <BannerSwiper banners={banners} openGame={openGame} />;
};
