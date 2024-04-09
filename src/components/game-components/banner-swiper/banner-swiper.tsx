import { useEffect, useRef } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { IBanner } from "../../page-components/dashboard/type";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";

const DEFAULT_DELAY_SLIDER = 5000;
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
            slidesOffsetBefore={8}
            loop={true}
            rewind={true}
            slidesPerView={"auto"}
            spaceBetween={8}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="swiper-banner"
            autoplay={{
                delay: DEFAULT_DELAY_SLIDER,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            }}
            centeredSlides={false}
            longSwipes={false}
            threshold={10}
            ref={swiperRef}
            grid={{ fill: "row" }}
            roundLengths={true}
            shortSwipes={true}
        >
            {banners.map((banner) => {
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
                        <img className="banner-img" src={banner.path} alt={banner.gameId.toString()} />
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
};
