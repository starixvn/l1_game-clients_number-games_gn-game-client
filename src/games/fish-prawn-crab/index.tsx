import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import React from "react";

import GatewayGameBase from "../../components/shared/game-base/gateway-gamebase";
import { GameBaseState, GameState, GatewayGameBaseProps } from "../../components/shared/game-base/type";
import ScoreboardBasic from "../../components/shared/round-history/scoreboard/basic";
import FishPrawnCrabBetOptions from "./bet-options";
import { Result, SettlementResult } from "./fish-prawn-crab";
import FishPrawnCrabResult, { FishPrawnCrabResultCollapse, FishPrawnCrabShakeThePlate } from "./fish-prawn-crab-result";
import Styles from "./fish-prawn-crab.module.scss";
import OddComponent from "./odd";
import GetScoreboardDotDetails from "./scoreboard-round-history";
import StatisticComponent from "./statistic";

export const choicesMapper = { stag: 0, gourd: 1, rooster: 2, fish: 3, crab: 4, prawn: 5 };
export const choicesBackgroundMapper = {
    stag: "result-info-stag",
    gourd: "result-info-gourd",
    rooster: "result-info-rooster",
    fish: "result-info-fish",
    crab: "result-info-crab",
    prawn: "result-info-prawn",
};
export const OddNames = {
    single: "single",
    double: "double",
    triple: "triple",
};
export enum ResultBet {
    stag,
    gourd,
    rooster,
    fish,
    crab,
    prawn,
}

const DefaultOdds = "single";
const DiceImgMapper = ["dice-nai", "dice-bau", "dice-ga", "dice-ca", "dice-cua", "dice-tom"];

class FishPrawnCrab extends GatewayGameBase<GatewayGameBaseProps, GameBaseState<Result, SettlementResult>> {
    constructor(props: GatewayGameBaseProps) {
        super(props);

        this.state = { ...this.defaultState };
    }

    getMainOptions(): string[] {
        return Object.keys(choicesMapper);
    }

    getOddsByChoice(choice: string) {
        const { gameConfigs } = this.state;
        const odds = gameConfigs.odds;

        return odds[DefaultOdds];
    }

    renderBetOptions() {
        const { gameState, settlementResult, result, showWinningAnimation } = this.state;
        return (
            <FishPrawnCrabBetOptions
                gameState={gameState}
                settlementResult={settlementResult ?? { crab: false, fish: false, gourd: false, prawn: false, rooster: false, stag: false }}
                result={result}
                isShowWinningEffect={showWinningAnimation}
            />
        );
    }

    renderRoundHistory() {
        return <OddComponent />;
    }

    renderStatistic() {
        return <StatisticComponent roundHistory={this.state.roundHistory}></StatisticComponent>;
    }

    renderResult() {
        const { result } = this.state;
        return <FishPrawnCrabResult result={result}></FishPrawnCrabResult>;
    }

    renderResultCollapse() {
        const { result } = this.state;
        return <FishPrawnCrabResultCollapse result={result} />;
    }

    renderBoard() {
        const { gameState, roundHistory } = this.state;
        return (
            <ScoreboardBasic
                roundHistory={roundHistory.slice(0, 30)}
                gameState={gameState}
                getDotDetails={GetScoreboardDotDetails}
            ></ScoreboardBasic>
        );
    }

    get isShowStartRoundAnimation() {
        return this.state.gameState === GameState.BeforeStartRound;
    }

    renderStartRoundAnimation() {
        const { durations } = this.props;
        const { roundId } = this.state;
        return (
            <FishPrawnCrabShakeThePlate
                key={roundId}
                playAnimation={this.timeCounter >= durations.placingBets + durations.beforeStartRound}
                roundId={roundId}
            />
        );
    }

    renderSettlementInfo() {
        const { result } = this.state;
        const settlementResultInfo = Object.values(result).map((dice) => {
            return {
                className: Object.values(choicesBackgroundMapper)[dice],
                value: this.getGameTranslate(Object.keys(choicesMapper)[dice]),
            };
        });
        return (
            <div className={Styles["result-container"]}>
                {settlementResultInfo &&
                    settlementResultInfo.map((info, index) => {
                        return (
                            <div key={index} className={Styles[info.className]}>
                                {info.value}
                            </div>
                        );
                    })}
            </div>
        );
    }
}

export default withRouter(withTranslation()(FishPrawnCrab));
