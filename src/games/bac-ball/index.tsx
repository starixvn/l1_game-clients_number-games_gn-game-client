import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import React from "react";
import GameBase from "../../components/game-base/";
import { GameBaseProps, GameBaseState, GatewayGameBaseProps } from "../../components/game-base/type";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import RoundResult from "../../components/game-components/round-result";
import { BacBallResult, BacBallSettlementResult } from "./types";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { RoundResultData } from "../../_shared/constants";

const results: RoundResultData[] = [
    {
        betChoiceShort: "P",
        color: "blue",
        count: 37,
    },
    {
        betChoiceShort: "B",
        color: "red",
        count: 15,
    },
    {
        betChoiceShort: "T",
        color: "green",
        count: 7,
    },
];

class BacBall extends GameBase<GameBaseProps, GameBaseState<BacBallResult, BacBallSettlementResult>> {
    constructor(props: GatewayGameBaseProps) {
        super(props);

        this.state = { ...this.defaultState };
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderHeaderBlock() {
        const { gameState } = this.state;

        return (
            <>
                <div id="round-id" className="round-id">
                    #{this.state.roundId}
                </div>
                <div id="countdown-timer" className="countdown-timer">
                    <CountdownTimer key={gameState} />
                </div>
            </>
        );
    }

    renderResultBlock() {
        return <BacBallResultBlock />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderScoreboards() {
        return <RoundResult results={results} />;
    }
}

export default withRouter(withTranslation()(BacBall));
