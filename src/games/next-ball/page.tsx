import { withRouter } from "next/router";
import { JSX } from "react";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useSystemContext, useSystemDispatch } from "../../_shared/react-contexts";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../_shared/react-hooks";
import GameBase from "../../components/game-base/";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseProps, Round } from "../../components/game-base/type";
import PercentageStatistic from "../../components/game-components/statistic";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { DrawIdBlock } from "../bac-ball/draw-id-block";
import { NextBallBettingBlock } from "./next-ball-betting-block";
import { NextGameRoundDatatHandler } from "./next-ball-game-round-data-handler";
import { NextBallBetHistoryModal } from "./history";
import NextBallResultBlock from "./next-ball-result-block";
import Scoreboard from "./scoreboard";
import { NextBallResult, NextBallSettlementResult } from "./types";
import { NextBallBetOptions } from "./next-ball-constants";

class NextBall extends GameBase<GameBaseProps> {
    private turnIdHandler?: TurnIdHandler;

    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        super(props, new TurnStateHandler(), new TurnGameStateHandler(), gameMessageHandler, new NextGameRoundDatatHandler());

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
        Array.from({ length: 75 }, (_, i) => i + 1).forEach((result) =>
            loadPixiAnimations(`/static/images/cage/number/${result}.json`, () => ({}))
        );
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation } = this.props.gameStateContextModel;

        return (
            <NextBallResultBlock
                roundHistory={roundHistory as Round<NextBallResult, NextBallSettlementResult>[]}
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
        return <NextBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <NextBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const calculators = {
            [NextBallBetOptions.OVER]: (countResult: object, total: number) =>
                Math.round((countResult[NextBallBetOptions.OVER] * 100) / total),
            [NextBallBetOptions.UNDER]: (countResult: object, total: number) =>
                100 - Math.round((countResult[NextBallBetOptions.OVER] * 100) / total),
            [NextBallBetOptions.ODD]: (countResult: object, total: number) =>
                Math.round((countResult[NextBallBetOptions.ODD] * 100) / total),
            [NextBallBetOptions.EVEN]: (countResult: object, total: number) =>
                100 - Math.round((countResult[NextBallBetOptions.ODD] * 100) / total),
        };

        return <PercentageStatistic roundHistory={roundHistory} statisticRuleEntries={Object.entries(calculators)} group={2} />;
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;

        return <Scoreboard isShowBlink={isShowBlink} roundHistory={roundHistory as Round<NextBallResult, NextBallSettlementResult>[]} />;
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock />;
    }
}

const NextBalllWrapper = (props) => {
    return (
        <GameStateProvider>
            <NextBalllFC {...props} />
        </GameStateProvider>
    );
};

const NextBalllFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <NextBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [
                    [NextBallBetOptions.OVER, NextBallBetOptions.UNDER],
                    [NextBallBetOptions.ODD, NextBallBetOptions.EVEN],
                ],
            }}
        />
    );
};

export default withRouter(NextBalllWrapper);
