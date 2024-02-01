import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import React, { useEffect } from "react";

import { BetOptionData, RoundResultData } from "../../_shared/constants";
import AnimatedBingo from "../../components/game-components/animated-bingo";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import PercentageCircle from "../../components/game-components/percentage-circle";
import RoundResult from "../../components/game-components/round-result";
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

export default function BacBall() {
    const dataPlayer = betData[0];
    const dataBanker = betData[1];
    const dataTie = betData[2];

    const onClickPlayer = () => {
        console.log("onClickPlayer");
    };

    const onClickBanker = () => {
        console.log("onClickBanker");
    };
    const onClickTie = () => {
        console.log("onClickTie");
    };

    const [highlightWinningPlayerFrames, setHighlightWinningPlayerFrames] = React.useState<Texture<Resource>[]>([]);
    useEffect(() => {
        const loadCageLoopsJson = async () => {
            const sprite = await Assets.load<Spritesheet>("/images/bac-number/highlight-winning-player.json");
            setHighlightWinningPlayerFrames(sprite.animations["highlight-winning-player"]);
        };
        loadCageLoopsJson();
    }, []);

    return (
        <>
            <div className="round-id">#2345</div>
            <div className="countdown-timer">00:30</div>

            <div className={Style["result-container"]}>
                <div className={Style["player-container"]}>
                    <div className={Style["lottery-player-container"]}>
                        <Cage color={CageColor.Blue} ballColor={BallColor.Blue} isSmall={true} />
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
                        <Cage color={CageColor.Red} ballColor={BallColor.Red} isSmall={true} />
                    </div>
                </div>
            </div>
            <AnimatedBingo />
            <div className={`${Style["betting-zone"]}`}>
                <div className={Style["left-corner"]}>
                    {highlightWinningPlayerFrames.length > 0 && (
                        <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                            <Container position={[90, 95]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={highlightWinningPlayerFrames}
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
                <div className={Style["right-corner"]}></div>
                <div className={`${Style["player"]} text-white relative`} onClick={onClickPlayer}>
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

                <div className={`${Style["banker"]} text-white relative`} onClick={onClickBanker}>
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

                <div className={`${Style["tie"]} text-white flex flex-col items-center pt-2 relative`} onClick={onClickTie}>
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

            <RoundResult roundId={20} resultData={resultData} />
        </>
    );
}
