import { withRouter } from "next/router";

import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import GameBase from "../../components/game-base/";
import { GameBaseProps } from "../../components/game-base/type";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import { StatisticFollowPercent } from "../../components/game-components/statistic";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallResult, BacBallSettlementResult } from "./types";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { GameStateHandler } from "../../components/game-base/game-state-handler";
import MessageTransmitter from "../../_shared/helpers/message-transmitter";
import { GameMessageHandler } from "../../components/game-base/game-message-handler";

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
class BacBall extends GameBase<GameBaseProps> {
    constructor(props: GameBaseProps) {
        const messageTransmitter = MessageTransmitter();
        const gameMessageHandler = new GameMessageHandler(props.dispatch, messageTransmitter);

        super(props, new TurnStateHandler(), new GameStateHandler(), messageTransmitter, gameMessageHandler);
    }

    componentDidMount() {
        super.componentDidMount();
    }


    renderResultBlock() {
        return <BacBallResultBlock messageTransmitter={this.messageTransmitter} />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <StatisticFollowPercent roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries}></StatisticFollowPercent>;
    }

    renderScoreboards() {
        return <img className="mt-1" src="/static/images/scoreboard.png" />;
    }
}

const BacBallWrapper = (props) => {
    const defaultResult: BacBallResult = null;

    const defaultSettlementResult: BacBallSettlementResult = {
        banker: true,
        drawId: 0,
        player: false,
        tie: false,
    };
    return (
        <GameStateProvider defaultResult={defaultResult} defaultSettlementResult={defaultSettlementResult}>
            <BacBallFC {...props} />
        </GameStateProvider>
    );
};

const BacBallFC = (props) => {
    return (
        <BacBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
