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
import { GameMessageHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, Round } from "../../components/game-base/type";
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import { SeBallBetOptions } from "./se-ball-constants";
import { NextGameRoundDataHandler } from "./se-ball-game-round-data-handler";
import Styles from "./se-ball.module.scss";
import { SeBallResult, SeBallSettlementResult } from "./types";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const SeBallBettingBlock = dynamic(() => import("./se-ball-betting-block"));
const RedAndBlueStatistic = dynamic(() => import("../../components/game-components/statistic/red-blue-statistic"));
const SeBallBetHistoryModal = dynamic(() => import("./history"));
const ScoreboardSeBall = dynamic(() => import("./scoreboard"));
const SeBallResultBlock = dynamic(() => import("./se-ball-result-block"));

export type SeBallState = {
    statisticGroup?: number;
};

class SeBall extends GameBase<GameBaseProps> {
    state: SeBallState = { statisticGroup: 0 };
    private readonly roundIdHandler?: RoundIdHandler;
    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new RoundStateHandler(),
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: new NextGameRoundDataHandler(),
            gameSoundHandler: new RoundGameSoundHandler({ gameSound: () => props.gameSound }),
        };
        super(props, gameBaseHandlers);

        this.roundIdHandler = new RoundIdHandler({
            dispatch: props.dispatch,
            gameStateContextModel: this.getGameStateContext.bind(this),
            gameMessageHandler,
            totalTurns: props.totalTurns,
            durations: props.durations,
        });
    }

    override registerHandlers(): void {
        super.registerHandlers();

        this.roundIdHandler?.registerEvents();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation, isPlayStartRoundAnimation } =
            this.props.gameStateContextModel;

        return (
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

        const subChoicesClass = {
            [SeBallBetOptions.BLUE3]: Styles[`statistic-${SeBallBetOptions.BLUE3}`],
            [SeBallBetOptions.RED2]: Styles[`statistic-${SeBallBetOptions.RED2}`],
            [SeBallBetOptions.RED3]: Styles[`statistic-${SeBallBetOptions.RED3}`],
            [SeBallBetOptions.RED4]: Styles[`statistic-${SeBallBetOptions.RED4}`],
            [SeBallBetOptions.BLUE4]: Styles[`statistic-${SeBallBetOptions.BLUE4}`],
        };

        return (
            <RedAndBlueStatistic
                roundHistory={roundHistory}
                mainChoices={[SeBallBetOptions.ODD, SeBallBetOptions.EVEN]}
                className={classNameIndo}
                subChoices={[
                    SeBallBetOptions.BLUE3,
                    SeBallBetOptions.RED2,
                    SeBallBetOptions.RED3,
                    SeBallBetOptions.RED4,
                    SeBallBetOptions.BLUE4,
                ]}
                subChoicesClass={subChoicesClass}
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
        return <DrawIdBlock showRoundId={true} />;
    }
}

const SeBallWrapper = (props) => {
    return (
        <GameStateProvider>
            <SeBallFC {...props} />
        </GameStateProvider>
    );
};

const SeBallFC = (props) => {
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

export default withRouter(SeBallWrapper);
