import { withRouter } from "next/router";
import { JSX } from "react";

import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useSystemContext, useSystemDispatch } from "../../_shared/react-contexts";
import { GameStateProvider, useGameStateContext, useGameStatesDispatch } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../_shared/react-hooks";
import GameBase from "../../components/game-base/";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseProps, Round } from "../../components/game-base/type";
import PercentageStatistic from "../../components/game-components/statistic";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import BacBallResultBlock from "./bac-ball-result-block";
import { BacBallBetOptions, StatisticRuleEntries } from "./constants";
import { DrawIdBlock } from "./draw-id-block";
import { BacBallBetHistoryModal } from "./history";
import Scoreboard from "./scoreboard";
import { BacBallResult, BacBallSettlementResult } from "./types";

const totalBalls = 30;

class BacBall extends GameBase<GameBaseProps> {
    private turnIdHandler?: TurnIdHandler;

    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        super(props, new TurnStateHandler(), new TurnGameStateHandler(), gameMessageHandler);

        this.turnIdHandler = new TurnIdHandler({
            dispatch: props.dispatch,
            gameStateContextModel: this.getGameStateContext.bind(this),
            gameMessageHandler,
            totalTurns: props.totalTurns,
            durations: props.durations,
        });
    }

    override registerHandlers(): void {
        super.registerHandlers();

        this.turnIdHandler?.registerEvents();
    }

    componentDidMount() {
        super.componentDidMount();

        // Load all animation resources in background
        Array.from({ length: totalBalls }, (_, i) => i + 1).forEach((result) =>
            loadPixiAnimations(`/static/images/cage/number/${result}.json`)
        );
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation } = this.props.gameStateContextModel;

        return (
            <BacBallResultBlock
                roundHistory={roundHistory as Round<BacBallResult, BacBallSettlementResult>[]}
                result={result}
                roundState={roundState}
                roundData={roundData}
                turnCounter={turnCounter}
                drawId={drawId}
                playResultAnimation={playResultAnimation}
            />
        );
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <BacBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <PercentageStatistic roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries} />;
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;

        return <Scoreboard isShowBlink={isShowBlink} roundHistory={roundHistory as Round<BacBallResult, BacBallSettlementResult>[]} />;
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock />;
    }
}

const BacBallWrapper = (props) => {
    return (
        <GameStateProvider>
            <BacBallFC {...props} />
        </GameStateProvider>
    );
};

const BacBallFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <BacBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[BacBallBetOptions.PLAYER, BacBallBetOptions.BANKER]],
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
