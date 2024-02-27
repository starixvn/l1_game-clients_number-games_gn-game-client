import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import { FC, useCallback, useEffect, useMemo, useState } from "react";

import { numberWithCommas } from "../../_shared/helpers";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useGameActionContext, useSystemContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../components/game-base/type";
import PercentageCircle from "../../components/game-components/percentage-circle";
import { WinningResultEffect } from "../../components/game-components/winning-result-effect";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./types";

export const BacBallBettingBlock: FC = () => {
    const [winningPlayerFrames, setWinningPlayerFrames] = useState<Texture<Resource>[]>([]);
    const [winningTieFrames, setWinningTieFrames] = useState<Texture<Resource>[]>([]);
    const gameActionContext = useGameActionContext();
    const gameStateContext = useGameStateContext();
    const systemContext = useSystemContext();

    useEffect(() => {
        if (winningPlayerFrames.length === 0 || winningTieFrames.length === 0) {
            const handleLoadResource = async () => {
                await loadPixiAnimations("/static/images/bac-number/highlight-winning-player.json", (sprite) => {
                    setWinningPlayerFrames(sprite.animations["highlight-winning-player"]);
                });

                await loadPixiAnimations("/static/images/bac-number/highlight-winning-tie.json", (sprite) => {
                    setWinningTieFrames(sprite.animations["highlight-winning-tie"]);
                });
            };

            handleLoadResource();
        }
    }, [winningPlayerFrames.length, winningTieFrames.length]);

    const onClickBet = useCallback(
        (choice) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );

    const convertStakeToString = (amount: number, rate: number) => (amount ? numberWithCommas(amount / rate, 1) : "");
    const rate = gameStateContext.rate;

    const playerTotalBet = gameStateContext?.totalBets["player"] ?? 0;
    const playerTotalBetRender = convertStakeToString(playerTotalBet, rate);

    const bankerTotalBet = gameStateContext?.totalBets["banker"] ?? 0;
    const bankerTotalBetRender = convertStakeToString(bankerTotalBet, rate);

    const tieTotalBet = gameStateContext?.totalBets["tie"] ?? 0;
    const tieTotalBetRender = convertStakeToString(tieTotalBet, rate);

    const playerOwnBetsValue = gameStateContext?.ownBets["player"] ?? 0;
    const playerNotConfirmOwnBetsValue = gameStateContext?.notConfirmOwnBets["player"] ?? 0;
    const playerOwnBets = playerOwnBetsValue + playerNotConfirmOwnBetsValue;

    const playerOwnBetsRender = useMemo(() => {
        return playerOwnBets != 0 ? (
            <span id="player-own-bet" className="bet-value">
                {playerOwnBets}
            </span>
        ) : (
            <></>
        );
    }, [playerOwnBets]);

    const bankerOwnBetsValue = gameStateContext?.ownBets["banker"] ?? 0;
    const bankerNotConfirmOwnBetsValue = gameStateContext?.notConfirmOwnBets["banker"] ?? 0;
    const bankerOwnBets = bankerOwnBetsValue + bankerNotConfirmOwnBetsValue;

    const bankerOwnBetsRender = useMemo(() => {
        return bankerOwnBets != 0 ? (
            <span id="banker-own-bet" className="bet-value">
                {bankerOwnBets}
            </span>
        ) : (
            <></>
        );
    }, [bankerOwnBets]);

    const tieOwnBetsValue = gameStateContext?.ownBets["tie"] ?? 0;
    const tieNotConfirmOwnBetsValue = gameStateContext?.notConfirmOwnBets["tie"] ?? 0;
    const tieOwnBets = tieOwnBetsValue + tieNotConfirmOwnBetsValue;

    const tieOwnBetsRender = useMemo(() => {
        return tieOwnBets != 0 ? (
            <span id="tie-own-bet" className="bet-value">
                {tieOwnBets}
            </span>
        ) : (
            <></>
        );
    }, [tieOwnBets]);

    const dataPlayer = { players: 1, betChoice: "player" };
    const dataBanker = { players: 1, betChoice: "banker" };
    const dataTie = { players: 1, betChoice: "tie" };

    const betPercentage = gameStateContext?.betPercentage ?? { player: 0, banker: 0, tie: 0 };
    const playerBetCount = gameStateContext?.playerBetCount ?? { player: 0, banker: 0, tie: 0 };

    const isShowWinningHighlightResult = (betChoice: string) => {
        if (!gameStateContext) {
            return false;
        }

        const { roundState, settlementResult, showResultInfo } = gameStateContext;

        return roundState === RoundState.DisplayResult && settlementResult && settlementResult[betChoice] && showResultInfo;
    };

    const isShowHighlightPrevResult = (betChoice: string) => {
        if (!gameStateContext || !gameStateContext.roundHistory[0]) {
            return false;
        }

        const prevResult = gameStateContext.roundHistory[0].settlementResult;

        return (
            (gameStateContext.roundState === RoundState.BeforeStartRound || gameStateContext.roundState === RoundState.InRound) &&
            prevResult[betChoice]
        );
    };

    if (winningPlayerFrames.length > 0 && winningTieFrames.length > 0) {
        return (
            <div className={`${Style["betting-zone"]}`}>
                <div className={Style["left-corner"]}></div>
                <div className={Style["right-corner"]}></div>
                <div
                    className={`${Style["player"]} text-white relative`}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.PLAYER);
                    }}
                >
                    {isShowWinningHighlightResult(BacBallBetOptions.PLAYER) && (
                        <div className={Style["winning-effect"]}>
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 95]}>
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
                        </div>
                    )}

                    {isShowHighlightPrevResult(BacBallBetOptions.PLAYER) && <div className={Style["highlight-prev-result-player"]}></div>}
                    <div className={`flex justify-between pt-5`}>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="player-coin-icon" className="icon-coin"></span>
                                <span id="player-total-stakes" className="stakes-value">
                                    {playerTotalBetRender}
                                </span>
                            </div>
                            <div className="flex items-center players gap-1">
                                <span id="player-user-icon" className="icon-user"></span>
                                <span id="player-no" className="player-value">
                                    {playerBetCount["player"]}
                                </span>
                            </div>
                        </div>
                        <div id="player-percent" className={Style.percent}>
                            <PercentageCircle percentage={betPercentage["player"]} color="#98cdff" />
                        </div>
                    </div>
                    <div id="player-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataPlayer.betChoice}
                    </div>
                    <div id="player-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds?.["player"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>{playerOwnBetsRender}</div>
                </div>

                <div
                    className={`${Style["banker"]} text-white relative`}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.BANKER);
                    }}
                >
                    {isShowWinningHighlightResult(BacBallBetOptions.BANKER) && (
                        <div className={Style["winning-effect"]}>
                            <Stage width={210} height={210} options={{ backgroundAlpha: 0 }}>
                                <Container position={[90, 95]}>
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
                        </div>
                    )}
                    {isShowHighlightPrevResult(BacBallBetOptions.BANKER) && (
                        <div className={`${Style["highlight-prev-result-player"]} ${Style["reverse"]}`}></div>
                    )}
                    <div className={`flex pt-5 justify-between`}>
                        <div id="banker-percent" className={Style.percent}>
                            <PercentageCircle percentage={betPercentage["banker"]} color="#f9bcb9" />
                        </div>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="banker-coin-icon" className="icon-coin"></span>
                                <span id="banker-total-stakes" className="stakes-value">
                                    {bankerTotalBetRender}
                                </span>
                            </div>
                            <div className="flex items-center players gap-1 justify-end">
                                <span id="banker-user-icon" className="icon-user"></span>
                                <span id="banker-no" className="player-value">
                                    {playerBetCount["banker"]}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="banker-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataBanker.betChoice}
                    </div>
                    <div id="banker-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds?.["banker"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>{bankerOwnBetsRender}</div>
                </div>

                <div
                    className={`${Style["tie"]} text-white flex flex-col items-center pt-2 relative`}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.TIE);
                    }}
                >
                    {isShowWinningHighlightResult(BacBallBetOptions.TIE) && (
                        <Stage width={210} height={210} options={{ backgroundAlpha: 0 }} className="absolute">
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
                    {isShowHighlightPrevResult(BacBallBetOptions.TIE) && <div className={Style["highlight-prev-result-tie"]}></div>}
                    <div id="tie-percent" className={Style.percent}>
                        <PercentageCircle percentage={betPercentage["tie"]} color="#2fc856" />
                    </div>
                    <div className={Style.stake}>
                        <div className={`flex items-center ${Style["total-stakes"]} gap-1 justify-center mt-1`}>
                            <span id="tie-coin-icon" className="icon-coin"></span>
                            <span id="tie-total-stakes" className="stakes-value">
                                {tieTotalBetRender}
                            </span>
                        </div>
                        <div className="flex items-center players gap-1 justify-center">
                            <span id="tie-user-icon" className="icon-user"></span>
                            <span id="tie-no" className="player-value">
                                {playerBetCount["tie"]}
                            </span>
                        </div>
                    </div>
                    <div id="tie-bet-name" className="bet-name text-center mt-3">
                        {dataTie.betChoice}
                    </div>
                    <div id="tie-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds?.["tie"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>{tieOwnBetsRender}</div>
                </div>

                <WinningResultEffect />
            </div>
        );
    }

    return <div>Loading....</div>;
};
