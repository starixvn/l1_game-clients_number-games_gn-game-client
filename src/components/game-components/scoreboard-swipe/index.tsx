import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import Style from "./scoreboard-swipe.module.scss";

import Scoreboard from "../round-history/scoreboard";
import { BacBallBeadRoadCharacterElement, BacBallBeadRoadValueElement } from "../../../games/bac-ball/scoreboard-elements";
import { Round } from "../../game-base/type";

const ScoreboardSwipe: React.FC<{ roundHistory: Round<any, any>[] }> = ({ roundHistory }) => {
    return (
        <Swiper slidesPerView={"auto"} spaceBetween={10} className="mySwiper">
            <SwiperSlide>
                <Scoreboard
                    rounds={roundHistory}
                    element={BacBallBeadRoadCharacterElement}
                    arrange={BacBallBeadRoadCharacterElement.arrange}
                    column={18}
                    row={6}
                />
            </SwiperSlide>
            <SwiperSlide>
                <Scoreboard
                    rounds={roundHistory}
                    element={BacBallBeadRoadValueElement}
                    arrange={BacBallBeadRoadValueElement.arrange}
                    column={18}
                    row={6}
                />
            </SwiperSlide>
        </Swiper>
    );
};

export default ScoreboardSwipe;
