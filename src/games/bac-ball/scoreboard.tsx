import "swiper/css";
import "swiper/css/pagination";

import { Component, ReactNode } from "react";
import { Round } from "../../components/game-base/type";
import { ScoreboardProps, SlidableScoreboard, SwitchableScoreboard } from "../../components/game-components/round-history/scoreboard";
import {
    BacBallBeadRoadCharacterElement,
    BacBallBeadRoadValueElement,
    BacBallBigEyeElement,
    BacBallBigRoadConverter,
    BacBallBigRoadElement,
    BacBallCockroachPigElement,
    BacBallSmallRoadElement,
} from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { BacBallResult, BacBallSettlementResult } from "./types";

export type ScoreboardComponentProps = {
    roundHistory: Round<BacBallResult, BacBallSettlementResult>[];
};

export class Scoreboard extends Component<ScoreboardComponentProps> {
    onSwitchBigRoad(board: Partial<ScoreboardProps<BacBallSettlementResult>>) {
        return {
            ...board,
            className: `${board.className} ${Styles["scoreboard-expand"]}`,
        };
    }

    renderBigRoad(): ReactNode {
        const { roundHistory } = this.props;
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        return (
            <SwitchableScoreboard
                rounds={settlements}
                className={Styles["scoreboard-multiple"]}
                type="scale"
                onSwitch={this.onSwitchBigRoad.bind(this)}
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
        );
    }

    renderBeadRoad(): ReactNode {
        const { roundHistory } = this.props;

        return (
            <div className={Styles["scoreboard-full"]}>
                <SwitchableScoreboard
                    rounds={roundHistory}
                    type="switch"
                    scoreboards={[
                        {
                            element: BacBallBeadRoadCharacterElement,
                            arrange: BacBallBeadRoadCharacterElement.arrange,
                            column: 18,
                            row: 6,
                        },
                    ]}
                />
            </div>
        );
    }

    render(): ReactNode {
        return <SlidableScoreboard boards={[this.renderBigRoad(), this.renderBeadRoad()]} />;
    }
}
