import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

export const Banner = () => {
    return (
        <Swiper
            slidesPerView={"auto"}
            spaceBetween={8}
            pagination={{
                clickable: true,
            }}
            modules={[Pagination]}
            className="swiper-banner"
        >
            <SwiperSlide>
                <img className="banner-img" src="/static/images/banner/banner-1.png" alt="banner-1" />
            </SwiperSlide>
            <SwiperSlide>
                <img className="banner-img" src="/static/images/banner/banner-2.png" alt="banner-2" />
            </SwiperSlide>
            <SwiperSlide>
                <img className="banner-img" src="/static/images/banner/banner-2.png" alt="banner-2" />
            </SwiperSlide>
        </Swiper>
    );
};
