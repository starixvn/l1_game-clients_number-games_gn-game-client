import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import {
    BacBallBeadRoadCharacterElement,
    BacBallBeadRoadValueElement,
    BacBallBigRoadConverter,
    BacBallBigRoadElement,
    BacBallBigEyeElement,
    BacBallSmallRoadElement,
    BacBallCockroachPigElement,
} from "../../../games/bac-ball/scoreboard-elements";
import { Round } from "../../game-base/type";
import Scoreboard from "../round-history/scoreboard";
import Styles from "./scoreboard-swipe.module.scss";
import { useState } from "react";

const ScoreboardSwipe: React.FC<{ roundHistory: Round<any, any>[] }> = ({ roundHistory }) => {
    const [switchBeadRoad, setSwitchBeadRoad] = useState(false);
    const settlements = roundHistory.map((round) => round.settlementResult);

    const handleSwitchBeadRoad = () => {
        setSwitchBeadRoad((prevShow) => !prevShow);
    };

    return (
        <Swiper slidesPerView={"auto"} spaceBetween={10} className="mySwiper">
            <SwiperSlide>
                <div className={Styles["scoreboard-multiple"]}>
                    <Scoreboard
                        rounds={settlements}
                        element={BacBallBigRoadElement}
                        arrange={BacBallBigRoadElement.arrange(BacBallBigRoadConverter.instance)}
                        row={6}
                        column={27}
                        elementClassName={Styles["big-road-small-element"]}
                    />
                    <div className={Styles["scoreboard-derived-multiple"]}>
                        <Scoreboard
                            rounds={settlements}
                            element={BacBallBigEyeElement}
                            arrange={BacBallBigEyeElement.arrange(BacBallBigRoadConverter.instance, "bigEyeBoy")}
                            row={6}
                            column={18}
                            className={Styles["derived-board-small"]}
                            elementClassName={Styles["derived-board-small-element"]}
                        />
                        <Scoreboard
                            rounds={settlements}
                            element={BacBallSmallRoadElement}
                            arrange={BacBallSmallRoadElement.arrange(BacBallBigRoadConverter.instance, "smallRoad")}
                            row={6}
                            column={18}
                            className={Styles["derived-board-small"]}
                            elementClassName={Styles["derived-board-small-element"]}
                        />
                        <Scoreboard
                            rounds={settlements}
                            element={BacBallCockroachPigElement}
                            arrange={BacBallCockroachPigElement.arrange(BacBallBigRoadConverter.instance, "cockroachPig")}
                            row={6}
                            column={18}
                            className={Styles["derived-board-small"]}
                            elementClassName={Styles["derived-board-small-element"]}
                        />
                    </div>
                </div>
            </SwiperSlide>
            <SwiperSlide>
                <div className={Styles["scoreboard-full"]} onClick={handleSwitchBeadRoad}>
                    {switchBeadRoad ? (
                        <Scoreboard
                            rounds={roundHistory}
                            element={BacBallBeadRoadValueElement}
                            arrange={BacBallBeadRoadValueElement.arrange}
                            column={18}
                            row={6}
                        />
                    ) : (
                        <Scoreboard
                            rounds={roundHistory}
                            element={BacBallBeadRoadCharacterElement}
                            arrange={BacBallBeadRoadCharacterElement.arrange}
                            column={18}
                            row={6}
                        />
                    )}
                </div>
            </SwiperSlide>
        </Swiper>
    );
};

export default ScoreboardSwipe;
