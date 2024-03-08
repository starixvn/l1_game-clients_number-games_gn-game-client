import { useTranslate } from "@tolgee/react";
import { withRouter } from "next/router";
import { JSX } from "react";
import { useSystemContext } from "../../_shared/react-contexts";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import GameBase from "../../components/game-base/";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseProps, Round } from "../../components/game-base/type";
import { Scoreboard } from "./scoreboard";
import { PercentageStatistic } from "../../components/game-components/statistic";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { BacBallBettingBlock } from "./bac-ball-betting-block";
import { BacBallResultBlock } from "./bac-ball-result-block";
import { BacBallBetOptions, StatisticRuleEntries } from "./constants";
import { BacBallBetHistoryModal } from "./history";
import { BacBallResult, BacBallSettlementResult } from "./types";
import { DrawIdBlock } from "./draw-id-block";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useTranslator } from "../../_shared/react-hooks";

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

        // Load all animations in background
        Array.from({ length: 75 }, (_, i) => i + 1).forEach((result) =>
            loadPixiAnimations(`/static/images/cage/number/${result}.json`, () => ({}))
        );
    }

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
                translate: t,
                hedgeBetGroups: [[BacBallBetOptions.PLAYER, BacBallBetOptions.BANKER]],
            }}
        />
    );
};

export default withRouter(BacBallWrapper);
