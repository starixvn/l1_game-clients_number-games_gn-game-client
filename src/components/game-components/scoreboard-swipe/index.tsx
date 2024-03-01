import { useMemo } from "react";
import "swiper/css";
import "swiper/css/pagination";
import {
    BacBallBeadRoadCharacterElement,
    BacBallBeadRoadValueElement,
    BacBallBigEyeElement,
    BacBallBigRoadConverter,
    BacBallBigRoadElement,
    BacBallCockroachPigElement,
    BacBallSmallRoadElement,
} from "../../../games/bac-ball/scoreboard-elements";
import { Round } from "../../game-base/type";
import { SlidableScoreboard, SwitchableScoreboard } from "../round-history/scoreboard";
import Styles from "./scoreboard-swipe.module.scss";

const ScoreboardSwipe: React.FC<{ roundHistory: Round<any, any>[] }> = ({ roundHistory }) => {
    const settlements = [...roundHistory].map((round) => round.settlementResult);

    return (
        <SlidableScoreboard
            boards={[
                useMemo(
                    () => (
                        <SwitchableScoreboard
                            className={Styles["scoreboard-multiple"]}
                            rounds={settlements}
                            type="scale"
                    onSwitch={(board) => ({ ...board, className: `${board.className} ${Styles["scoreboard-expand"]}` })}
                            scoreboards={[
                                {
                                    element: BacBallBigRoadElement,
                                    arrange: BacBallBigRoadElement.arrange(BacBallBigRoadConverter.instance),
                                    column: 27,
                                    row: 6,
                                    className: Styles["big-road-small"],
                                    elementClassName: Styles["big-road-small-element"],
                                    blockClassName: Styles["board-small"],
                                },
                                {
                                    element: BacBallBigEyeElement,
                                    arrange: BacBallBigEyeElement.arrange(BacBallBigRoadConverter.instance, "bigEyeBoy"),
                                    column: 18,
                                    row: 6,
                                    className: Styles["big-eye-boy"],
                                    elementClassName: Styles["derived-board-small-element"],
                                    block: 2,
                                    blockClassName: Styles["board-small"],
                                },
                                {
                                    element: BacBallSmallRoadElement,
                                    arrange: BacBallSmallRoadElement.arrange(BacBallBigRoadConverter.instance, "smallRoad"),
                                    column: 18,
                                    row: 6,
                                    className: Styles["small-road"],
                                    elementClassName: Styles["derived-board-small-element"],
                                    block: 2,
                                    blockClassName: Styles["board-small"],
                                },
                                {
                                    element: BacBallCockroachPigElement,
                                    arrange: BacBallCockroachPigElement.arrange(BacBallBigRoadConverter.instance, "cockroachPig"),
                                    column: 18,
                                    row: 6,
                                    className: Styles["cockroach-pig"],
                                    elementClassName: Styles["derived-board-small-element"],
                                    block: 2,
                                    blockClassName: Styles["board-small"],
                                },
                            ]}
                        />
                    ),
                    [settlements]
                ),
                useMemo(
                    () => (
                        <div className={Styles["scoreboard-full"]}>
                            <SwitchableScoreboard
                                rounds={roundHistory}
                                type="switch"
                                scoreboards={[
                                    {
                                        element: BacBallBeadRoadValueElement,
                                        arrange: BacBallBeadRoadValueElement.arrange,
                                        column: 18,
                                        row: 6,
                                    },
                                    {
                                        element: BacBallBeadRoadCharacterElement,
                                        arrange: BacBallBeadRoadCharacterElement.arrange,
                                        column: 18,
                                        row: 6,
                                    },
                                ]}
                            />
                        </div>
                    ),
                    [roundHistory]
                ),
            ]}
        />
    );
};

export default ScoreboardSwipe;
