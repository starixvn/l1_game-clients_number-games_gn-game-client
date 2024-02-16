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
import { StatisticFollowPercent } from "../../components/game-components/statistic";

const statisticData = [
    {
        betChoice: "player",
        betChoiceShort: "P",
        color: "blue",
    },
    {
        betChoice: "banker",
        betChoiceShort: "B",
        color: "red",
    },
    {
        betChoice: "tie",
        betChoiceShort: "T",
        color: "green",
    },
];

export const Choices = { player: "player", banker: "banker", tie: "tie" };

export const StatisticRuleEntries = Object.entries({
    [Choices.player]: (countResult: object, total: number) =>
        countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0,
    [Choices.banker]: (countResult: object, total: number) =>
        100 -
        ((countResult[Choices.player] ? Math.round((countResult[Choices.player] * 100) / total) : 0) +
            (countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0)),
    [Choices.tie]: (countResult: object, total: number) =>
        countResult[Choices.tie] ? Math.round((countResult[Choices.tie] * 100) / total) : 0,
});

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
        return <RoundResult roundHistory={this.state.roundHistory} statisticData={statisticData} />;
        // return (
        //     <StatisticFollowPercent
        //         roundHistory={this.state.roundHistory}
        //         statisticRuleEntries={StatisticRuleEntries}
        //     ></StatisticFollowPercent>
        // );
    }
}

export default withRouter(withTranslation()(BacBall));
