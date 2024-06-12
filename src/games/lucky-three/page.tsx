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
import { tolgee } from "../../_shared/tolgee";
import GameBase from "../../components/game-base";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, Round } from "../../components/game-base/type";
import { NewRoundTransitionWithinExtraSeconds } from "../../components/game-components/new-round-transition";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { LuckyThreeBetOptions } from "./lucky-three-constants";
import { NextGameRoundDataHandler } from "./lucky-three-game-round-data-handler";
import Styles from "./lucky-three.module.scss";
import { LuckyThreeResult, LuckyThreeSettlementResult } from "./types";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const LuckyThreeBettingBlock = dynamic(() => import("./lucky-three-betting-block"));
const RedAndBlueStatistic = dynamic(() => import("../../components/game-components/statistic/red-blue-statistic"));
const LuckyThreeBetHistoryModal = dynamic(() => import("./history"));
const ScoreboardLuckyThree = dynamic(() => import("./scoreboard"));
const LuckyThreeResultBlock = dynamic(() => import("./lucky-three-result-block"));

export type LuckyThreeState = {
    statisticGroup?: number;
};

class LuckyThree extends GameBase<GameBaseProps> {
    state: LuckyThreeState = { statisticGroup: 0 };
    private readonly turnIdHandler?: TurnIdHandler;
    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new TurnStateHandler(),
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: new NextGameRoundDataHandler(),
        };

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
            prevRoundState,
            roundData,
            turnCounter,
            drawId,
            playResultAnimation,
            isPlayStartRoundAnimation,
        } = this.props.gameStateContextModel;

        return (
            <LuckyThreeResultBlock
                roundHistory={roundHistory as Round<LuckyThreeResult, LuckyThreeSettlementResult>[]}
                result={result}
                roundState={roundState}
                roundData={roundData}
                drawId={drawId}
                playResultAnimation={playResultAnimation}
                isPlayStartRoundAnimation={isPlayStartRoundAnimation}
                prevRoundState={prevRoundState}
                turnCounter={turnCounter}
            />
        );
    }

    renderBettingBlock() {
        return <LuckyThreeBettingBlock />;
    }

    renderBetHistoryModal() {
        return <LuckyThreeBetHistoryModal />;
    }

    renderNewRoundTransition() {
        return <NewRoundTransitionWithinExtraSeconds />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const subBetOptionClass = {
            [LuckyThreeBetOptions.BLUE3]: Styles["statistic-blue3"],
            [LuckyThreeBetOptions.BLUE2]: Styles["statistic-blue2"],
            [LuckyThreeBetOptions.RED2]: Styles["statistic-red2"],
            [LuckyThreeBetOptions.RED3]: Styles["statistic-red3"],
        };

        return (
            <RedAndBlueStatistic
                roundHistory={roundHistory}
                mainChoices={[LuckyThreeBetOptions.OVER, LuckyThreeBetOptions.UNDER]}
                className={classNameIndo}
                subChoices={[LuckyThreeBetOptions.BLUE3, LuckyThreeBetOptions.BLUE2, LuckyThreeBetOptions.RED2, LuckyThreeBetOptions.RED3]}
                subChoicesClass={subBetOptionClass}
            />
        );
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;

        return (
            <ScoreboardLuckyThree
                isShowBlink={isShowBlink}
                roundHistory={roundHistory as Round<LuckyThreeResult, LuckyThreeSettlementResult>[]}
                isOverUnder={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock />;
    }
}

const LuckyThreeWrapper = (props) => {
    return (
        <GameStateProvider>
            <LuckyThreeFC {...props} />
        </GameStateProvider>
    );
};

const LuckyThreeFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <LuckyThree
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[LuckyThreeBetOptions.OVER, LuckyThreeBetOptions.UNDER]],
            }}
        />
    );
};

export default withRouter(LuckyThreeWrapper);
