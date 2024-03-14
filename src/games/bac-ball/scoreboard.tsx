import "swiper/css";
import "swiper/css/pagination";

import { Component, ReactNode, memo } from "react";
import { Round } from "../../components/game-base/type";
import { ScoreboardProps, SlidableScoreboard, SwitchableScoreboard } from "../../components/game-components/round-history/scoreboard";
import { BacBallBeadRoadCharacterElement, BacBallBigRoadConverter, BacBallBigRoadElement } from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { BacBallResult, BacBallSettlementResult } from "./types";

export type ScoreboardComponentProps = {
    roundHistory: Round<BacBallResult, BacBallSettlementResult>[];
    isShowBlink: boolean;
};

export class Scoreboard extends Component<ScoreboardComponentProps> {
    onSwitchBigRoad(board: Partial<ScoreboardProps<BacBallSettlementResult>>) {
        return {
            ...board,
            className: `${board.className} ${Styles["scoreboard-expand"]}`,
        };
    }

    renderBigRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        isShowBlink && BacBallBigRoadConverter.addBlinkNode(settlements);

        return (
            <div className={Styles["scoreboard-full"]} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    scoreboards={[
                        {
                            element: BacBallBigRoadElement,
                            arrange: BacBallBigRoadElement.arrange(BacBallBigRoadConverter.instance),
                            column: 18,
                            row: 6,
                        },
                    ]}
                />
            </div>
        );
    }

    renderBeadRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
        const rounds = isShowBlink ? [{}, ...roundHistory] : roundHistory;

        return (
            <div className={Styles["scoreboard-full"]} id="bead-road">
                <SwitchableScoreboard
                    rounds={rounds}
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

export default memo(Scoreboard);
