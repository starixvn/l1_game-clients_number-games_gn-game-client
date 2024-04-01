import { Component, ReactNode, memo } from "react";
import { Round } from "../../components/game-base/type";
import { SlidableScoreboard, SwitchableScoreboard } from "../../components/game-components/round-history/scoreboard";
import { BeadRoadElement, BigRoadElement } from "../../components/game-components/round-history/scoreboard/elements";
import { NextBallBigRoadConverter, createBeadRoadElement, createBigRoadElement } from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { NextBallResult, NextBallSettlementResult } from "./types";

export type ScoreboardComponentProps = {
    roundHistory: Round<NextBallResult, NextBallSettlementResult>[];
    isShowBlink: boolean;
    isOddEven: boolean;
};

export class Scoreboard extends Component<ScoreboardComponentProps> {
    renderBigRoad(): ReactNode {
        const { roundHistory, isShowBlink } = this.props;
        const settlements = [...roundHistory].map((round) => round.settlementResult);

        isShowBlink && NextBallBigRoadConverter.addBlinkNode(settlements);

        return (
            <div className={Styles["scoreboard-full"]} id="big-road">
                <SwitchableScoreboard
                    rounds={settlements}
                    type="switch"
                    scoreboards={[
                        {
                            element: createBigRoadElement(this.props.isOddEven),
                            arrange: BigRoadElement.arrange(NextBallBigRoadConverter.getInstance(this.props.isOddEven)),
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
                            element: createBeadRoadElement(this.props.isOddEven),
                            arrange: BeadRoadElement.arrange,
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
