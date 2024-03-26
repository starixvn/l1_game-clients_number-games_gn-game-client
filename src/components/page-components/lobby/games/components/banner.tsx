import React, { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getBannerIds, getBanners, getOfferGamesIds } from "../../../../../_shared/helpers";
import { usePlayerContext } from "../../../../../_shared/react-contexts";
import { tolgee } from "../../../../../_shared/tolgee";
import { IBanner, ILobbyConfigs } from "../../../dashboard/type";

const DEFAULT_DELAY_SLIDER = 5000;
const DEFAULT_BANNER_PATH = "/static/images/lobby/banners";

export const Banner: React.FC<{ openGame: Function; lobbyConfigs: ILobbyConfigs }> = ({ openGame, lobbyConfigs }) => {
    const { authorizeInfo } = usePlayerContext();
    const locale = tolgee.getLanguage() ?? "en";
    const swiperRef = useRef(null);
    const [filterBanners, setFilterBanners] = useState<IBanner[]>([]);
    const [banners, setBanners] = useState<IBanner[]>([]);

    const getGameIdOfferBanner = () => {
        const gameIds: number[] = [];
        const offerGamesIds = getOfferGamesIds(authorizeInfo);
        console.log("offerGamesIds", offerGamesIds);
        const bannerIds = getBannerIds(lobbyConfigs);
        console.log("bannerIds", bannerIds);
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
        if (swiperRef?.current?.swiper) {
            const swiper = swiperRef.current.swiper;
            swiper.on("slideChange", () => {
                const currentSlide = swiper.realIndex;
                const currentBanner = banners[currentSlide];
                if (currentBanner) {
                    swiper.params.autoplay.delay = currentBanner.displayTime * 1000;
                } else {
                    swiper.params.autoplay.delay = DEFAULT_DELAY_SLIDER;
                }
                swiper.params.autoplay.disableOnInteraction = false;
                swiper.autoplay.start();
            });
        }
    }, [swiperRef?.current?.swiper, banners]);

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

    if (banners.length <= 0) {
        return <></>;
    }

    return (
        <>
            {
                <Swiper
                    slidesOffsetBefore={20}
                    loop={true}
                    slidesPerView={1}
                    spaceBetween={8}
                    pagination={{ clickable: true }}
                    modules={[Pagination, Autoplay]}
                    className="swiper-banner"
                    autoplay={{
                        delay: DEFAULT_DELAY_SLIDER,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    centeredSlides={true}
                    centeredSlidesBounds={true}
                    ref={swiperRef}
                >
                    {banners.map((banner) => {
                        if (!banner?.path) {
                            return <></>;
                        }

                        return (
                            <SwiperSlide key={banner.gameId} onClick={() => openGame(banner.gameId)}>
                                <img className="banner-img" src={banner.path} alt={banner.gameId.toString()} />
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            }
        </>
    );
};
