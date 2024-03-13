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
import { PercentageStatistic } from "../../components/game-components/statistic";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallBetOptions, MaxProbability, MinProbability, StatisticRuleEntries } from "./constants";
import { DrawIdBlock } from "./draw-id-block";
import { BacBallBetHistoryModal } from "./history";
import { Scoreboard } from "./scoreboard";
import { BacBallResult, BacBallSettlementResult } from "./types";
import { probabilityToBetOdds } from "../../_shared/helpers";

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
        this.calculateOddsRange.bind(this);
    }

    override registerHandlers(): void {
        super.registerHandlers();

        this.turnIdHandler?.registerEvents();
    }

    componentDidMount() {
        super.componentDidMount();

        // Load all animations in background
        Array.from({ length: 75 }, (_, i) => i + 1).forEach((result) =>
            loadPixiAnimations(`/static/images/cage/number/${result}.json`, () => ({}))
        );
    }

    calculateOddsRange = (margin: any) => {
        return {
            min: this.getBetOdds(MaxProbability, margin),
            max: this.getBetOdds(MinProbability, margin),
        };
    };

    getBetOdds = (probabilities: Record<string, number>, margins: Record<string, number>[] = []): Record<string, number> => {
        const sortedMargins = margins.toSorted((margin) => margin.max);
        return Object.keys(probabilities).reduce((result, choice) => {
            const prob = probabilities[choice];
            const originalOdds = probabilityToBetOdds(prob);
            const margin = sortedMargins.find((m) => originalOdds <= m.max)?.[choice];
            result[choice] = probabilityToBetOdds(prob, margin);
            return result;
        }, {} as any);
    };

    renderResultBlock() {
        return <BacBallResultBlock />;
    }

    renderBettingBlock() {
        return <BacBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <BacBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <PercentageStatistic roundHistory={roundHistory} statisticRuleEntries={StatisticRuleEntries}></PercentageStatistic>;
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
    const { t } = useTranslator();

    return (
        <BacBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                hedgeBetGroups: [[BacBallBetOptions.PLAYER, BacBallBetOptions.BANKER]],
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
