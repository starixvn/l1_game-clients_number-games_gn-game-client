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
import GameBase from "../../components/game-base/";
import { GameMessageHandler, TurnIdHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, Round } from "../../components/game-base/type";
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import { RoundGameStateHandler } from "../../components/round-base/round-game-state-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import ScoreboardSeBall from "./scoreboard";
import { SeBallBetOptions } from "./se-ball-constants";
import { NextGameRoundDataHandler } from "./se-ball-game-round-data-handler";
import SeBallResultBlock from "./se-ball-result-block";
import Styles from "./se-ball.module.scss";
import { SeBallResult, SeBallSettlementResult } from "./types";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const SeBallBettingBlock = dynamic(() => import("./se-ball-betting-block"));
const OtherPercentageStatistic = dynamic(() => import("../../components/game-components/statistic/other-percentage-statistic"));
const SeBallBetHistoryModal = dynamic(() => import("./history"));

export type SeBallState = {
    statisticGroup?: number;
};

class SeBall extends GameBase<GameBaseProps> {
    state: SeBallState = { statisticGroup: 0 };
    private turnIdHandler?: TurnIdHandler;
    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new RoundStateHandler(),
            gameStateHandler: new RoundGameStateHandler(),
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
            <div>
                <div className={`star-field ${Styles["star-field"]}`}>
                    <div className="layer"></div>
                    <div className="layer"></div>
                    <div className="layer"></div>
                </div>
                <SeBallResultBlock
                    roundHistory={roundHistory as Round<SeBallResult, SeBallSettlementResult>[]}
                    result={result}
                    roundState={roundState}
                    roundData={roundData}
                    turnCounter={turnCounter}
                    drawId={drawId}
                    playResultAnimation={playResultAnimation}
                    isPlayStartRoundAnimation={isPlayStartRoundAnimation}
                />
            </div>
        );
    }

    renderBettingBlock() {
        return <SeBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <SeBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const calculators = {
            [SeBallBetOptions.ODD]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.ODD] * 100) / total) || 0,
            [SeBallBetOptions.EVEN]: (countResult: object, total: number) =>
                100 - Math.round((countResult[SeBallBetOptions.ODD] * 100) / total) || 0,
        };

        const otherCalculator = {
            [SeBallBetOptions.BLUE3]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.BLUE3] * 100) / total) || 0,
            [SeBallBetOptions.RED2]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.RED2] * 100) / total) || 0,
            [SeBallBetOptions.RED3]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.RED3] * 100) / total) || 0,
            [SeBallBetOptions.RED4]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.RED4] * 100) / total) || 0,
            [SeBallBetOptions.BLUE4]: (countResult: object, total: number) =>
                100 -
                    (Math.round((countResult[SeBallBetOptions.BLUE4] * 100) / total) +
                        Math.round((countResult[SeBallBetOptions.RED2] * 100) / total) +
                        Math.round((countResult[SeBallBetOptions.RED3] * 100) / total) +
                        Math.round((countResult[SeBallBetOptions.RED4] * 100) / total)) || 0,
        };

        const subBetOptionClass = {
            [SeBallBetOptions.BLUE3]: Styles["statistic-blue3"],
            [SeBallBetOptions.RED2]: Styles["statistic-red2"],
            [SeBallBetOptions.RED3]: Styles["statistic-red3"],
            [SeBallBetOptions.RED4]: Styles["statistic-red4"],
            [SeBallBetOptions.BLUE4]: Styles["statistic-blue4"],
        };

        return (
            <OtherPercentageStatistic
                roundHistory={roundHistory}
                statisticRuleEntries={Object.entries(calculators)}
                className={classNameIndo}
                otherStatisticRuleEntries={Object.entries(otherCalculator)}
                subBetOptionClass={subBetOptionClass}
            />
        );
    }

    renderGameStatus() {
        return GameStatusMap.RoundBaseStatus;
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;

        return (
            <ScoreboardSeBall
                isShowBlink={isShowBlink}
                roundHistory={roundHistory as Round<SeBallResult, SeBallSettlementResult>[]}
                isOddEven={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock />;
    }
}

const SeBalllWrapper = (props) => {
    return (
        <GameStateProvider>
            <SeBalllFC {...props} />
        </GameStateProvider>
    );
};

const SeBalllFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <SeBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[SeBallBetOptions.ODD, SeBallBetOptions.EVEN]],
            }}
        />
    );
};

export default withRouter(SeBalllWrapper);
