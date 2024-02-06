import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import React from "react";
import { RoundResultData } from "../../_shared/constants";
import GameBase from "../../components/game-base/";
import { GameBaseProps, GameBaseState, GameState, GatewayGameBaseProps } from "../../components/game-base/type";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import RoundResult from "../../components/game-components/round-result";
import { Result, SettlementResult } from "./bac-ball";
import { HeaderBlock } from "../../components/game-base/game-blocks/header-block";
import { ResultBlock } from "../../components/game-base/game-blocks/result-block";
import { StatisticBlock } from "../../components/game-base/game-blocks/statistic-block";
import { ScoreboardBlock } from "../../components/game-base/game-blocks/scoreboard-block";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";

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
                <HeaderBlock messageTransmitter={this.messageTransmitter} />
            </>
        );
    }

    renderResultBlock() {
        return <BacBallResultBlock messageTransmitter={this.messageTransmitter} getGameState={() => this.state} />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock messageTransmitter={this.messageTransmitter} getGameState={() => this.state} />;
    }

    renderScoreboards() {
        return (
            <>
                <RoundResult roundId={20} resultData={resultData} />
                <ScoreboardBlock messageTransmitter={this.messageTransmitter} />
            </>
        );
    }

    renderStatistic() {
        return <StatisticBlock messageTransmitter={this.messageTransmitter} />;
    }
}

export default withRouter(withTranslation()(BacBall));
