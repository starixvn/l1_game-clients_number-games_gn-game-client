import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { withTranslation } from "next-i18next";
import { withRouter } from "next/router";
import { Assets, Spritesheet } from "pixi.js";
import React from "react";

import { BetOptionData, RoundResultData } from "../../_shared/constants";
import GameBase from "../../components/game-base";
import { GameBaseProps, GameBaseState, GatewayGameBaseProps } from "../../components/game-base/type";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import PercentageCircle from "../../components/game-components/percentage-circle";
import RoundResult from "../../components/game-components/round-result";
import { Result, SettlementResult } from "./bac-ball";
import Style from "./bac-ball.module.scss";

const betData: BetOptionData[] = [
    {
        betChoice: "Player",
        odds: 1.97,
        totalStakes: 1382.76,
        players: 37,
        percent: 55,
    },
    {
        betChoice: "Banker",
        odds: 1.97,
        totalStakes: 1444,
        players: 15,
        percent: 35,
    },
    {
        betChoice: "Tie",
        odds: 1.97,
        totalStakes: 357.44,
        players: 7,
        percent: 10,
    },
];

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

        this.onClickPlayer = this.onClickPlayer.bind(this);
        this.onClickBanker = this.onClickBanker.bind(this);
        this.onClickTie = this.onClickTie.bind(this);
    }

    async loadWinningPlayerJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/bac-number/highlight-winning-player.json");

        this.setState({ winningPlayerFrames: sprite.animations["highlight-winning-player"] });
    }

    async loadWinningTieJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/bac-number/highlight-winning-tie.json");

        this.setState({ winningTieFrames: sprite.animations["highlight-winning-tie"] });
    }

    async loadCageLoopsJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/cage-balls.json");

        this.setState({ cageBallsLoopFrames: sprite.animations["loop"] });
    }

    async loadBallJson() {
        const sprite = await Assets.load<Spritesheet>("/static/images/cage/ball.json");
        const blueFrames = sprite.animations["blue"];
        const redFrames = sprite.animations["red"];

        this.setState({ cageBallFrames: { blue: blueFrames, red: redFrames } });
    }

    componentDidMount() {
        super.componentDidMount();
        this.loadWinningPlayerJson();
        this.loadWinningTieJson();
        this.loadCageLoopsJson();
        this.loadBallJson();
    }

    renderHeaderBlock() {
        return (
            <>
                <div className="round-id">#2345</div>
                <div className="countdown-timer">00:30</div>
            </>
        );
    }

    renderResultBlock() {
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
                        />
                    </div>
                </div>
            </div>
        );
    }

    onClickPlayer() {
        console.log("onClickPlayer");
    }

    onClickBanker() {
        console.log("onClickBanker");
    }
    onClickTie() {
        console.log("onClickTie");
    }

    renderBettingBlock() {
        const dataPlayer = betData[0];
        const dataBanker = betData[1];
        const dataTie = betData[2];
        const { winningPlayerFrames, winningTieFrames } = this.state;

        return (
            <div className={`${Style["betting-zone"]}`}>
                <div className={Style["left-corner"]}>
                    <div className={Style["winning-effect"]}>
                        {winningPlayerFrames.length > 0 && (
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 110]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={winningPlayerFrames}
                                        autoUpdate
                                        isPlaying={true}
                                        initialFrame={0}
                                        animationSpeed={0.2}
                                        loop={true}
                                    />
                                </Container>
                            </Stage>
                        )}
                    </div>
                </div>
                <div className={Style["right-corner"]}>
                    <div className={Style["winning-effect"]}>
                        {winningPlayerFrames.length > 0 && (
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 108]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={winningPlayerFrames}
                                        autoUpdate
                                        isPlaying={true}
                                        initialFrame={0}
                                        animationSpeed={0.2}
                                        loop={true}
                                    />
                                </Container>
                            </Stage>
                        )}
                    </div>
                </div>
                <div className={`${Style["player"]} text-white relative`} onClick={this.onClickPlayer}>
                    <div className={`flex justify-between pt-5`}>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span className="icon-coin"></span>
                                <span>{dataPlayer.totalStakes}</span>
                            </div>
                            <div className="flex items-center players gap-1">
                                <span className="icon-user"></span>
                                <span>{dataPlayer.players}</span>
                            </div>
                        </div>
                        <div className={Style.percent}>
                            <PercentageCircle percentage={dataPlayer.percent} />
                        </div>
                    </div>
                    <div className={`bet-name text-center ${Style["bet-name"]}`}>{dataPlayer.betChoice}</div>
                    <div className="bet-odds text-center">{dataPlayer.odds}</div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span className="bet-value">10</span>
                    </div>
                </div>

                <div className={`${Style["banker"]} text-white relative`} onClick={this.onClickBanker}>
                    <div className={`flex pt-5 justify-between`}>
                        <div className={Style.percent}>
                            <PercentageCircle percentage={dataBanker.percent} />
                        </div>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span className="icon-coin"></span>
                                <span>{dataBanker.totalStakes}</span>
                            </div>
                            <div className="flex items-center players gap-1 justify-end">
                                <span className="icon-user"></span>
                                <span>{dataBanker.players}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`bet-name text-center ${Style["bet-name"]}`}>{dataBanker.betChoice}</div>
                    <div className="bet-odds text-center">{dataBanker.odds}</div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span className="bet-value">10</span>
                    </div>
                </div>

                <div className={`${Style["tie"]} text-white flex flex-col items-center pt-2 relative`} onClick={this.onClickTie}>
                    {winningTieFrames.length > 0 && (
                        <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                            <Container position={[105, 77]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={winningTieFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.2}
                                    loop={true}
                                />
                            </Container>
                        </Stage>
                    )}
                    <div className={Style.percent}>
                        <PercentageCircle percentage={dataTie.percent} />
                    </div>
                    <div className={Style.stake}>
                        <div className={`flex items-center ${Style["total-stakes"]} gap-1 justify-center`}>
                            <span className="icon-coin"></span>
                            <span>{dataTie.totalStakes}</span>
                        </div>
                        <div className="flex items-center players gap-1 justify-center">
                            <span className="icon-user"></span>
                            <span>{dataTie.players}</span>
                        </div>
                    </div>
                    <div className="bet-name text-center mt-4">{dataTie.betChoice}</div>
                    <div className="bet-odds text-center">{dataTie.odds}</div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        <span className="bet-value">10</span>
                    </div>
                </div>
            </div>
        );
    }

    renderRoundResultBlock() {
        return <RoundResult roundId={20} resultData={resultData} />;
    }
}

export default withRouter(withTranslation()(BacBall));
