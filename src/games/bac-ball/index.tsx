import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import React from "react";
import { RoundResultData } from "../../_shared/constants";
import GameBase from "../../components/game-base/";
import { GameBaseProps, GameBaseState, GatewayGameBaseProps } from "../../components/game-base/type";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import RoundResult from "../../components/game-components/round-result";
import { Result, SettlementResult } from "./bac-ball";
import { BacBallResultBlockFC } from "./bac-ball-result-block";
import { BacBallBettingBlockFC } from "./bac-ball-betting-block";

const resultData: RoundResultData[] = [
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

class BacBall extends GameBase<GameBaseProps, GameBaseState<Result, SettlementResult>> {
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
        return <BacBallResultBlockFC messageTransmitter={this.messageTransmitter} getGameState={() => this.state} />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlockFC getGameState={() => this.state} />;
    }

    renderScoreboards() {
        return <RoundResult roundId={20} resultData={resultData} />;
    }
}

export default withRouter(withTranslation()(BacBall));
