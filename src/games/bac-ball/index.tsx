import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import { JSX } from "react";

import { useSystemContext, useSystemDispatch } from "../../_shared/react-contexts";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../_shared/react-hooks";
import GameBase from "../../components/game-base/";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, Round } from "../../components/game-base/type";
import { DrawIdBlock } from "../../components/game-components/draw-id";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallGameRoundDataHandler } from "./bac-ball-game-round-data-handler";
import BacBallResultBlock from "./bac-ball-result-block";
import { BacBallBetOptions, StatisticRuleEntries } from "./constants";
import Scoreboard from "./scoreboard";
import { BacBallResult, BacBallSettlementResult } from "./types";

const PercentageStatistic = dynamic(() => import("../../components/game-components/statistic"));
const BacBallBettingBlock = dynamic(() => import("./bac-ball-betting-block"));
const BacBallBetHistoryModal = dynamic(() => import("./history"));

class BacBall extends GameBase<GameBaseProps> {
    private turnIdHandler?: TurnIdHandler;

    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler :new TurnStateHandler(),
            gameStateHandler:new TurnGameStateHandler(),
            gameMessageHandler:gameMessageHandler,
            gameRoundDataHandler: new BacBallGameRoundDataHandler()
        }
        super(props, gameBaseHandlers);

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
    }

    renderResultBlock() {
        const {
            roundHistory,
            result,
            roundState,
            roundData,
            turnCounter,
            drawId,
            playResultAnimation,
            settlementResult,
            showResultInfo,
            isPlayStartRoundAnimation,
        } = this.props.gameStateContextModel;

        return (
            <BacBallResultBlock
                roundHistory={roundHistory as Round<BacBallResult, BacBallSettlementResult>[]}
                result={result}
                roundState={roundState}
                roundData={roundData}
                turnCounter={turnCounter}
                settlementResult={settlementResult}
                showResultInfo={showResultInfo}
                drawId={drawId}
                playResultAnimation={playResultAnimation}
                isPlayStartRoundAnimation={isPlayStartRoundAnimation}
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
