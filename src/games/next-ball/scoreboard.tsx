import "swiper/css";
import "swiper/css/pagination";

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
};

export type ScoreboardState = {
    isOddEven: boolean;
};

export class Scoreboard extends Component<ScoreboardComponentProps, ScoreboardState> {
    state = { isOddEven: false };

    onSwitchBoard() {
        this.setState({ isOddEven: !this.state.isOddEven });
    }

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
                            element: createBigRoadElement(this.state.isOddEven),
                            arrange: BigRoadElement.arrange(NextBallBigRoadConverter.getInstance(this.state.isOddEven)),
                            column: 18,
                            row: 6,
                            onClick: this.onSwitchBoard.bind(this),
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
                            element: createBeadRoadElement(this.state.isOddEven),
                            arrange: BeadRoadElement.arrange,
                            column: 18,
                            row: 6,
                            onClick: this.onSwitchBoard.bind(this),
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
