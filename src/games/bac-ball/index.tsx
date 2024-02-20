import { withRouter } from "next/router";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useDetermineGameState, useGetStateByNextGameState } from "../../_shared/react-hooks/use-determine-game-state";
import { useTimeCounter } from "../../_shared/react-hooks/use-time-counter";
import GameBase from "../../components/game-base/";
import { GameBaseProps } from "../../components/game-base/type";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import { StatisticFollowPercent } from "../../components/game-components/statistic";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallResult, BacBallSettlementResult } from "./types";

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
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderHeaderBlock() {
        const { roundId } = this.props.gameStateContextModel;
        return (
            <>
                <div id="round-id" className="round-id">
                    #{roundId}
                </div>
                <div id="countdown-timer" className="countdown-timer">
                    <CountdownTimer />
                </div>
            </>
        );
    }

    renderResultBlock() {
        return <BacBallResultBlock messageTransmitter={this.messageTransmitter} />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderScoreboards() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <StatisticFollowPercent roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries}></StatisticFollowPercent>;
    }
}

const BacBallWrapper = (props) => {
    const defaultResult: BacBallResult = {
        player: 0,
        banker: 0,
        drawId: 0,
    };

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
                determineGameState: useDetermineGameState,
                getTimeCounter: useTimeCounter,
                getStateByNextGameState: useGetStateByNextGameState,
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
