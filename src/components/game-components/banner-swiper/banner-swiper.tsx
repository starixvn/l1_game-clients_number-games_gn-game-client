import "swiper/css";
import "swiper/css/pagination";

import { useEffect, useRef } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";
import { IBanner } from "../../page-components/dashboard/type";
import { imageCache } from "../../../_shared/helpers/image-cache-controller";

export const DEFAULT_DELAY_SLIDER = 5000;
export const BannerSwiper: React.FC<{ banners: IBanner[]; openGame: Function }> = ({ banners, openGame }) => {
    const swiperRef = useRef(null);

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

    return (
        <Swiper
            loop={true}
            rewind={true}
            slidesPerView={"auto"}
            spaceBetween={4}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="swiper-banner"
            autoplay={{
                delay: DEFAULT_DELAY_SLIDER,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            ref={swiperRef}
            roundLengths={true}
        >
            {banners.map((banner, index) => {
                if (!banner?.path) {
                    return <></>;
                }
                return (
                    <SwiperSlide
                        key={banner.gameId}
                        onClick={() => {
                            openGame(banner.gameId);
                            AnalyticsHelper.trackFunction({ function: TrackingFunction.Banner, action: TrackingAction.Open });
                        }}
                    >
                        <img className="banner-img" src={imageCache[banner.path]} alt={"banner-blur"} width={734} height={248} />
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
};
