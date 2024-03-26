import React, { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { getBanners } from "../../../../../_shared/helpers";
import { tolgee } from "../../../../../_shared/tolgee";
import { IBanner, ILobbyConfigs } from "../../../dashboard/type";

const DEFAULT_DELAY_SLIDER = 5000;
export const Banner: React.FC<{ openGame: Function; lobbyConfigs: ILobbyConfigs }> = ({ openGame, lobbyConfigs }) => {
    const locale = tolgee.getLanguage() ?? "en";
    const swiperRef = useRef(null);
    const [banners, setBanners] = useState<IBanner[]>([]);

    useEffect(() => {
        if (lobbyConfigs) {
            setBanners(getBanners(lobbyConfigs));
        }
    }, [lobbyConfigs]);

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
    }, [swiperRef?.current?.swiper]);

    if (banners.length === 0) {
        return <></>;
    }

    return (
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
            {banners.map((banner) => (
                <SwiperSlide key={banner.gameId} onClick={() => openGame(banner.gameId)}>
                    <img
                        className="banner-img"
                        src={`/static/images/lobby/banners/${banner.gameId}/${banner.gameId}_${locale}.png`}
                        alt={banner.gameId.toString()}
                    />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};
