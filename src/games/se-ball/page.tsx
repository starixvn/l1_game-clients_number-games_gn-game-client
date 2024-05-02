import { withRouter } from "next/router";
import { JSX } from "react";

import dynamic from "next/dynamic";
import { useSystemContext, useSystemDispatch } from "../../_shared/react-contexts";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../_shared/react-hooks";
import GameBase from "../../components/game-base/";
import { GameMessageHandler } from "../../components/game-base/handlers";
import { GameBaseProps, Round } from "../../components/game-base/type";
import { SeBallBetOptions } from "./se-ball-constants";
import { NextGameRoundDataHandler } from "./se-ball-game-round-data-handler";
import SeBallResultBlock from "./se-ball-result-block";
import Scoreboard from "./scoreboard";
import { SeBallResult, SeBallSettlementResult } from "./types";
import { tolgee } from "../../_shared/tolgee";
import Styles from "./se-ball.module.scss";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import { RoundGameStateHandler } from "../../components/round-base/round-game-state-handler";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const SeBallBettingBlock = dynamic(() => import("./se-ball-betting-block"));
const PercentageStatistic = dynamic(() => import("../../components/game-components/statistic"));
const SeBallBetHistoryModal = dynamic(() => import("./history"));

export type SeBallState = {
    statisticGroup?: number;
};

class SeBall extends GameBase<GameBaseProps> {
    state: SeBallState = { statisticGroup: 0 };

    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        super(props, new RoundStateHandler(), new RoundGameStateHandler(), gameMessageHandler, new NextGameRoundDataHandler());
    }

    override registerHandlers(): void {
        super.registerHandlers();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, turnCounter, drawId, playResultAnimation } = this.props.gameStateContextModel;

        return (
            <SeBallResultBlock
                roundHistory={roundHistory as Round<SeBallResult, SeBallSettlementResult>[]}
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
        return <SeBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <SeBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const calculators = {
            [SeBallBetOptions.ODD]: (countResult: object, total: number) =>
                Math.round((countResult[SeBallBetOptions.ODD] * 100) / total) || 0,
            [SeBallBetOptions.EVEN]: (countResult: object, total: number) =>
                100 - Math.round((countResult[SeBallBetOptions.ODD] * 100) / total) || 0,
        };

        return (
            <PercentageStatistic
                roundHistory={roundHistory}
                statisticRuleEntries={Object.entries(calculators)}
                group={2}
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
                hedgeBetGroups: [
                    [SeBallBetOptions.ODD, SeBallBetOptions.EVEN],
                ],
            }}
        />
    );
};

export default withRouter(SeBalllWrapper);
