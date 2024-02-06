import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import { Assets, Spritesheet } from "pixi.js";
import React from "react";
import { RoundResultData } from "../../_shared/constants";
import GameBase from "../../components/game-base/";
import { GameBaseProps, GameBaseState, GameState, GatewayGameBaseProps } from "../../components/game-base/type";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import CountdownTimer from "../../components/game-components/countdown-timer/countdown-timer";
import RoundResult from "../../components/game-components/round-result";
import { Result, SettlementResult } from "./bac-ball";
import Style from "./bac-ball.module.scss";
import { HeaderBlock } from "../../components/game-base/game-blocks/header-block";
import { ResultBlock } from "../../components/game-base/game-blocks/result-block";
import { StatisticBlock } from "../../components/game-base/game-blocks/statistic-block";
import { ScoreboardBlock } from "../../components/game-base/game-blocks/scoreboard-block";
import { BacBallBettingBlock } from "./bac-ball-betting-block";

const resultData: RoundResultData[] = [
    {
        betChoiceShort: "P",
        color: "blue",
        count: 37,
    },
    {
        betChoiceShort: "B",
        color: "red",
        count: 15,
    },
    {
        betChoiceShort: "T",
        color: "green",
        count: 7,
    },
];

class BacBall extends GameBase<GameBaseProps, GameBaseState<Result, SettlementResult>> {
    constructor(props: GatewayGameBaseProps) {
        super(props);

        this.state = { ...this.defaultState };
    }

    async loadBallJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/ball.json");
        const blueFrames = sprite.animations["blue"];
        const redFrames = sprite.animations["red"];

        this.setState({ cageBallFrames: { blue: blueFrames, red: redFrames } });
    }

    async loadCageLoopsJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/cage-balls.json");

        this.setState({ cageBallsLoopFrames: sprite.animations["loop"] });
    }

    componentDidMount() {
        super.componentDidMount();
        this.loadCageLoopsJson();
        this.loadBallJson();
    }

    renderHeaderBlock() {
        const { gameState } = this.state;

        return (
            <>
                <div id="round-id" className="round-id">
                    #{this.state.roundId}
                </div>
                <div id="countdown-timer" className="countdown-timer">
                    <CountdownTimer key={gameState} />
                </div>
                <HeaderBlock messageTransmitter={this.messageTransmitter} />
            </>
        );
    }

    renderResultBlock() {
        if (!this.state.result) {
            return <></>;
        }

        const { player, banker } = this.state.result;

        return (
            <div className={Style["result-container"]}>
                <div className={Style["player-container"]}>
                    <div className={Style["lottery-player-container"]}>
                        <Cage
                            cageBallsLoopFrames={this.state.cageBallsLoopFrames}
                            cageBallFrames={this.state.cageBallFrames}
                            color={CageColor.Blue}
                            ballColor={BallColor.Blue}
                            isSmall={true}
                            result={player}
                            isShowResult={this.state.playResultAnimation}
                        />
                    </div>
                    <div className={Style["ball-container"]}>
                        <Ball number={38} color="red" />
                        <Ball number={27} color="blue" />
                        <Ball isLoading />
                        <Ball isEmpty />
                    </div>
                </div>
                <div className={Style["player-container"]}>
                    <div className={Style["ball-container"]}>
                        <Ball number={48} color="blue" />
                        <Ball number={3} color="blue" />
                        <Ball isLoading />
                        <Ball isEmpty />
                    </div>
                    <div className="lottery">
                        <Cage
                            cageBallsLoopFrames={this.state.cageBallsLoopFrames}
                            cageBallFrames={this.state.cageBallFrames}
                            color={CageColor.Red}
                            ballColor={BallColor.Red}
                            isSmall={true}
                            result={banker}
                            isShowResult={this.state.playResultAnimation}
                            delayShowResultTime={1000}
                        />
                    </div>
                </div>
                <ResultBlock messageTransmitter={this.messageTransmitter} />
            </div>
        );
    }

    renderBettingBlock() {
        return <BacBallBettingBlock messageTransmitter={this.messageTransmitter} getGameState={() => this.state} />;
    }

    renderScoreboards() {
        return (
            <>
                <RoundResult roundId={20} resultData={resultData} />
                <ScoreboardBlock messageTransmitter={this.messageTransmitter} />
            </>
        );
    }

    renderStatistic() {
        return <StatisticBlock messageTransmitter={this.messageTransmitter} />;
    }
}

export default withRouter(withTranslation()(BacBall));
