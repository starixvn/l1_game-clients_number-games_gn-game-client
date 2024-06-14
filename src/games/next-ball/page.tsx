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
import { PercentageStatistic } from "../../components/game-components/statistic";
import { TurnStateHandler } from "../../components/turn-base/turn-state-handler";
import NextBallBettingBlock from "./next-ball-betting-block";
import { NextBallBetOptions } from "./next-ball-constants";
import { NextGameRoundDataHandler } from "./next-ball-game-round-data-handler";
import NextBallResultBlock from "./next-ball-result-block";
import Styles from "./next-ball.module.scss";
import Scoreboard from "./scoreboard";
import { NextBallResult, NextBallSettlementResult } from "./types";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const NextBallBetHistoryModal = dynamic(() => import("./history"));

export type NextBallState = {
    statisticGroup?: number;
};

class NextBall extends GameBase<GameBaseProps> {
    state: NextBallState = { statisticGroup: 0 };

    private turnIdHandler?: TurnIdHandler;

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
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation, isPlayStartRoundAnimation } =
            this.props.gameStateContextModel;

        return (
            <NextBallResultBlock
                roundHistory={roundHistory as Round<NextBallResult, NextBallSettlementResult>[]}
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
        return <NextBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <NextBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        return (
            <PercentageStatistic
                roundHistory={roundHistory}
                mainChoices={[NextBallBetOptions.OVER, NextBallBetOptions.UNDER, NextBallBetOptions.ODD, NextBallBetOptions.EVEN]}
                choicesInGroups={[
                    [NextBallBetOptions.OVER, NextBallBetOptions.UNDER],
                    [NextBallBetOptions.ODD, NextBallBetOptions.EVEN],
                ]}
                selectedGroup={statisticGroup}
                onSelectGroup={(index: number) => this.setState({ statisticGroup: index })}
                className={classNameIndo}
            />
        );
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;

        return (
            <Scoreboard
                isShowBlink={isShowBlink}
                roundHistory={roundHistory as Round<NextBallResult, NextBallSettlementResult>[]}
                isOddEven={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock />;
    }
}

const NextBallWrapper = (props) => {
    return (
        <GameStateProvider>
            <NextBallFC {...props} />
        </GameStateProvider>
    );
};

const NextBallFC = (props) => {
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

export default withRouter(NextBallWrapper);
