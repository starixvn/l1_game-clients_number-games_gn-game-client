import { Component, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

export type SlidableScoreboardProps = { boards: ReactNode[] };

export class SlidableScoreboard extends Component<SlidableScoreboardProps> {
    render(): ReactNode {
        const { boards } = this.props;
        return (
            <Swiper slidesPerView={"auto"} spaceBetween={8}>
                {boards.map((board, key) => (
                    <SwiperSlide key={key}>{board}</SwiperSlide>
                ))}
            </Swiper>
        );
    }
}
