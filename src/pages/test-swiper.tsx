// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";

const SwiperSlideChild = ({ isActive, index }) => {
    console.log({ isActive, index });

    return (
        <div>
            SwiperSlide-{index} is {isActive ? "active" : "not active"}
        </div>
    );
};

export default function TestSwiper() {
    return (
        <div>
            <Swiper
                spaceBetween={50}
                slidesPerView={1}
                loop={true}
                onSlideChange={(swiper) => console.log("slide change", swiper.realIndex)}
                onSwiper={(swiper) => console.log(swiper)}
                className="mySwiper-test"
                width={500}
                autoHeight={true}
                initialSlide={2}
            >
                <SwiperSlide
                    style={{ height: "2000px" }}
                    id="SwiperSlide-1"
                    onChange={() => {
                        console.log("SwiperSlide 1 changed");
                    }}
                >
                    {({ isActive }) => SwiperSlideChild({ isActive, index: 1 })}
                </SwiperSlide>
                <SwiperSlide
                    style={{ height: "2000px" }}
                    id="SwiperSlide-2"
                    onChange={() => {
                        console.log("SwiperSlide 2 changed");
                    }}
                >
                    {({ isActive }) => SwiperSlideChild({ isActive, index: 2 })}
                </SwiperSlide>
                <SwiperSlide
                    style={{ height: "2000px" }}
                    id="SwiperSlide-3"
                    onChange={() => {
                        console.log("SwiperSlide 3 changed");
                    }}
                >
                    {({ isActive }) => SwiperSlideChild({ isActive, index: 3 })}
                </SwiperSlide>
            </Swiper>
        </div>
    );
}
