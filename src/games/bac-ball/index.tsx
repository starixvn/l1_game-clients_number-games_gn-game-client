import { useTranslate } from "@tolgee/react";
import { withRouter } from "next/router";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import GameBase from "../../components/game-base/";
import { GameMessageHandler, GameStateHandler } from "../../components/game-base/handlers";
import { GameBaseProps } from "../../components/game-base/type";
import { PercentageStatistic } from "../../components/game-components/statistic";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallResult, BacBallSettlementResult } from "./types";
import { useSystemContext } from "../../_shared/react-contexts";
import ScoreboardSwipe from "../../components/game-components/scoreboard-swipe";
import { BacBallBetOptions, StatisticRuleEntries } from "./constants";
import { BacBallBetHistoryBlock } from "./history";

class BacBall extends GameBase<GameBaseProps> {
    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);

        super(props, new TurnStateHandler(), new GameStateHandler(), gameMessageHandler);
        this.hedgeBetGroup = [BacBallBetOptions.PLAYER, BacBallBetOptions.BANKER];
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

    renderBetHistoryModal() {
        return <BacBallBetHistoryBlock socket={this.socket} />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <PercentageStatistic roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries}></PercentageStatistic>;
    }

    renderScoreboards() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <ScoreboardSwipe roundHistory={roundHistory} />;
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
                systemContextModel: useSystemContext(),
                translate: t,
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
