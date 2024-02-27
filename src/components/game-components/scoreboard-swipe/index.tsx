import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { BacBallBeadRoadValueElement, BacBallBigRoadConverter, BacBallBigRoadElement } from "../../../games/bac-ball/scoreboard-elements";
import { Round } from "../../game-base/type";
import Scoreboard from "../round-history/scoreboard";

const ScoreboardSwipe: React.FC<{ roundHistory: Round<any, any>[] }> = ({ roundHistory }) => {
    const settlements = roundHistory.map((round) => round.settlementResult);

    return (
        <Swiper slidesPerView={"auto"} spaceBetween={10} className="mySwiper">
            <SwiperSlide>
                <Scoreboard
                    rounds={settlements}
                    element={BacBallBigRoadElement}
                    arrange={BacBallBigRoadElement.arrange(BacBallBigRoadConverter.instance)}
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
