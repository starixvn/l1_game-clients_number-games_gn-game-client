import { useTranslate } from "@tolgee/react";
import { withRouter } from "next/router";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import GameBase from "../../components/game-base/";
import { GameMessageHandler } from "../../components/game-base/game-message-handler";
import { GameStateHandler } from "../../components/game-base/game-state-handler";
import { GameBaseProps } from "../../components/game-base/type";
import Scoreboard from "../../components/game-components/round-history/scoreboard";
import { StatisticFollowPercent } from "../../components/game-components/statistic";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallBeadRoadCharacterElement, BacBallBeadRoadValueElement } from "./scoreboard-elements";
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
        const gameMessageHandler = new GameMessageHandler(props.dispatch);

        super(props, new TurnStateHandler(), new GameStateHandler(), gameMessageHandler);
        this.hedgeBetGroup = ["player", "banker"];
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderResultBlock() {
        return <BacBallResultBlock />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <StatisticFollowPercent roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries}></StatisticFollowPercent>;
    }

    renderScoreboards() {
        const { roundHistory } = this.props.gameStateContextModel;

        return (
            <>
                <Scoreboard
                    rounds={roundHistory}
                    element={BacBallBeadRoadCharacterElement}
                    arrange={BacBallBeadRoadCharacterElement.arrange}
                    column={18}
                    row={6}
                />
                <br />
                <Scoreboard
                    rounds={roundHistory}
                    element={BacBallBeadRoadValueElement}
                    arrange={BacBallBeadRoadValueElement.arrange}
                    column={18}
                    row={6}
                />
            </>
        );
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
    const { t } = useTranslate([`${props.gameName}`, "Common", "SabaNumber"]);

    return (
        <BacBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                translate: t,
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
