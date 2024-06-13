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
import { SicBallBetOptions } from "./sic-ball-constants";
import { NextGameRoundDataHandler } from "./sic-ball-game-round-data-handler";
import Styles from "./sic-ball.module.scss";
import { SicBallResult, SicBallSettlementResult } from "./types";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const SicBallBettingBlock = dynamic(() => import("./sic-ball-betting-block"));
const RedAndBlueStatisticSubRoundCounter = dynamic(() => import("../../components/game-components/statistic/red-blue-statistic-sub-round-counter"));
const SicBallBetHistoryModal = dynamic(() => import("./history"));
const ScoreboardSeBall = dynamic(() => import("./scoreboard"));
const SicBallResultBlock = dynamic(() => import("./sic-ball-result-block"));

export type SicBallState = {
    statisticGroup?: number;
};

class SicBall extends GameBase<GameBaseProps> {
    state: SicBallState = { statisticGroup: 0 };
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
            <SicBallResultBlock
                roundHistory={roundHistory as Round<SicBallResult, SicBallSettlementResult>[]}
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
        return <SicBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <SicBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const subChoicesClass = {
            [SicBallBetOptions.SPECIFIC1]: Styles[`statistic-${SicBallBetOptions.SPECIFIC1}`],
            [SicBallBetOptions.SPECIFIC2]: Styles[`statistic-${SicBallBetOptions.SPECIFIC2}`],
            [SicBallBetOptions.SPECIFIC3]: Styles[`statistic-${SicBallBetOptions.SPECIFIC3}`],
            [SicBallBetOptions.SPECIFIC4]: Styles[`statistic-${SicBallBetOptions.SPECIFIC4}`],
            [SicBallBetOptions.SPECIFIC5]: Styles[`statistic-${SicBallBetOptions.SPECIFIC5}`],
            [SicBallBetOptions.SPECIFIC6]: Styles[`statistic-${SicBallBetOptions.SPECIFIC6}`],
        };

        return (
            <RedAndBlueStatisticSubRoundCounter
                roundHistory={roundHistory}
                mainChoices={[SicBallBetOptions.BIG, SicBallBetOptions.SMALL]}
                className={classNameIndo}
                subChoices={[
                    SicBallBetOptions.SPECIFIC1,
                    SicBallBetOptions.SPECIFIC2,
                    SicBallBetOptions.SPECIFIC3,
                    SicBallBetOptions.SPECIFIC4,
                    SicBallBetOptions.SPECIFIC5,
                    SicBallBetOptions.SPECIFIC6
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
                roundHistory={roundHistory as Round<SicBallResult, SicBallSettlementResult>[]}
                isBigSmall={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock showRoundId={true} />;
    }

    renderStatisticContent() {
        return <></>;
    }
}

const SicBallWrapper = (props) => {
    return (
        <GameStateProvider>
            <SicBallFC {...props} />
        </GameStateProvider>
    );
};

const SicBallFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <SicBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[SicBallBetOptions.BIG, SicBallBetOptions.SMALL]],
            }}
        />
    );
};

export default withRouter(SicBallWrapper);
