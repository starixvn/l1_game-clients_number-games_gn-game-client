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
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import { LuckyThreeBetOptions } from "./lucky-three-constants";
import Styles from "./lucky-three.module.scss";
import { LuckyThreeResult, LuckyThreeSettlementResult } from "./types";
import { NextGameRoundDataHandler } from "./lucky-three-game-round-data-handler";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import { TurnGameStateHandler } from "../../components/turn-base/turn-game-state-handler";

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
            gameStateHandler: new TurnGameStateHandler(),
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
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation, isPlayStartRoundAnimation } =
            this.props.gameStateContextModel;

        return (
            <LuckyThreeResultBlock
                roundHistory={roundHistory as Round<LuckyThreeResult, LuckyThreeSettlementResult>[]}
                result={result}
                roundState={roundState}
                roundData={roundData}
                turnCounter={turnCounter}
                drawId={drawId}
                playResultAnimation={playResultAnimation}
                isPlayStartRoundAnimation={isPlayStartRoundAnimation}
            />
        );
    }

    renderBettingBlock() {
        return <LuckyThreeBettingBlock />;
    }

    renderBetHistoryModal() {
        return <LuckyThreeBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const calculators = {
            [LuckyThreeBetOptions.OVER]: (countResult: object, total: number) =>
                Math.round((countResult[LuckyThreeBetOptions.OVER] * 100) / total) || 0,
            [LuckyThreeBetOptions.UNDER]: (countResult: object, total: number) =>
                100 - Math.round((countResult[LuckyThreeBetOptions.OVER] * 100) / total) || 0,
        };

        const otherCalculator = {
            [LuckyThreeBetOptions.RED2]: (countResult: object, total: number) =>
                Math.round((countResult[LuckyThreeBetOptions.RED2] * 100) / total) || 0,
            [LuckyThreeBetOptions.RED3]: (countResult: object, total: number) =>
                Math.round((countResult[LuckyThreeBetOptions.RED3] * 100) / total) || 0,
            [LuckyThreeBetOptions.BLUE2]: (countResult: object, total: number) =>
                Math.round((countResult[LuckyThreeBetOptions.BLUE2] * 100) / total) || 0,
            [LuckyThreeBetOptions.BLUE3]: (countResult: object, total: number) =>
                Math.round((countResult[LuckyThreeBetOptions.BLUE3] * 100) / total) || 0,
        };

        const subBetOptionClass = {
            [LuckyThreeBetOptions.RED2]: Styles["statistic-red2"],
            [LuckyThreeBetOptions.RED3]: Styles["statistic-red3"],
            [LuckyThreeBetOptions.BLUE2]: Styles["statistic-blue2"],
            [LuckyThreeBetOptions.BLUE3]: Styles["statistic-blue3"],
        };

        return (
            <RedAndBlueStatistic
                roundHistory={roundHistory}
                statisticRuleEntries={Object.entries(calculators)}
                className={classNameIndo}
                subChoicesStatisticRuleEntries={Object.entries(otherCalculator)}
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
