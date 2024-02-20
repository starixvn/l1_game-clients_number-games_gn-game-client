import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import { FC, useEffect, useState } from "react";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useGameActionContext } from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../components/game-base/type";
import PercentageCircle from "../../components/game-components/percentage-circle";
import Style from "./bac-ball.module.scss";

export const BacBallBettingBlock: FC = () => {
    const [winningPlayerFrames, setWinningPlayerFrames] = useState<Texture<Resource>[]>([]);
    const [winningTieFrames, setWinningTieFrames] = useState<Texture<Resource>[]>([]);
    const gameActionContext = useGameActionContext();
    const gameStateContext = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    useEffect(() => {
        if (winningPlayerFrames.length === 0 || winningTieFrames.length === 0) {
            loadPixiAnimations("/static/images/bac-number/highlight-winning-player.json", (sprite) => {
                setWinningPlayerFrames(sprite.animations["highlight-winning-player"]);
            });

            loadPixiAnimations("/static/images/bac-number/highlight-winning-tie.json", (sprite) => {
                setWinningTieFrames(sprite.animations["highlight-winning-tie"]);
            });
        }
    }, [winningPlayerFrames.length, winningTieFrames.length]);

    const onClickBet = (choice) => {
        if (gameStateContext.enabledQuickBet) {
            gameActionContext.placeBet(choice, gameStateContext.selectedChip);
        } else {
            dispatch({
                type: GameEventActionType.SHOW_CONFIRM_BET,
                payload: {
                    showConfirmBet: true,
                },
            });
        }
    };

    const dataPlayer = { players: 1, betChoice: "player" };
    const dataBanker = { players: 1, betChoice: "banker" };
    const dataTie = { players: 1, betChoice: "tie" };

    if (winningPlayerFrames.length > 0 && winningTieFrames.length > 0) {
        // waiting for rounduration class
        const isShowWinningHighlightPlayer =
            gameStateContext?.roundState === RoundState.DisplayResult && gameStateContext?.settlementResult?.player;
        const isShowWinningHighlightBanker =
            gameStateContext?.roundState === RoundState.DisplayResult && gameStateContext?.settlementResult?.banker;
        const isShowWinningHighlightTie =
            gameStateContext?.roundState === RoundState.DisplayResult && gameStateContext?.settlementResult?.tie;

        return (
            <div className={`${Style["betting-zone"]}`}>
                <div className={Style["left-corner"]}>
                    <div className={Style["winning-effect"]}>
                        {isShowWinningHighlightPlayer && (
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
                        {isShowWinningHighlightBanker && (
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
                <div
                    className={`${Style["player"]} text-white relative`}
                    onClick={() => {
                        onClickBet("player");
                    }}
                >
                    <div className={`flex justify-between pt-5`}>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="player-coin-icon" className="icon-coin"></span>
                                <span id="player-total-stakes">{gameStateContext?.totalBets["player"]}</span>
                            </div>
                            <div className="flex items-center players gap-1">
                                <span id="player-user-icon" className="icon-user"></span>
                                <span id="player-no">{dataPlayer.players}</span>
                            </div>
                        </div>
                        <div id="player-percent" className={Style.percent}>
                            <PercentageCircle percentage={50} />
                        </div>
                    </div>
                    <div id="player-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataPlayer.betChoice}
                    </div>
                    <div id="player-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds["player"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        {gameStateContext?.ownBets["player"] ? (
                            <span id="player-own-bet" className="bet-value">
                                {gameStateContext?.ownBets["player"]}
                            </span>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div
                    className={`${Style["banker"]} text-white relative`}
                    onClick={() => {
                        onClickBet("banker");
                    }}
                >
                    <div className={`flex pt-5 justify-between`}>
                        <div id="banker-percent" className={Style.percent}>
                            <PercentageCircle percentage={50} />
                        </div>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span id="banker-coin-icon" className="icon-coin"></span>
                                <span id="banker-total-stakes">{gameStateContext?.totalBets["banker"]}</span>
                            </div>
                            <div className="flex items-center players gap-1 justify-end">
                                <span id="banker-user-icon" className="icon-user"></span>
                                <span id="banker-no">{dataBanker.players}</span>
                            </div>
                        </div>
                    </div>
                    <div id="banker-bet-name" className={`bet-name text-center ${Style["bet-name"]}`}>
                        {dataBanker.betChoice}
                    </div>
                    <div id="banker-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds["banker"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        {gameStateContext?.ownBets["banker"] ? (
                            <span id="banker-own-bet" className="bet-value">
                                {gameStateContext?.ownBets["banker"]}
                            </span>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>

                <div
                    className={`${Style["tie"]} text-white flex flex-col items-center pt-2 relative`}
                    onClick={() => {
                        onClickBet("tie");
                    }}
                >
                    {isShowWinningHighlightTie && (
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
                    <div id="tie-percent" className={Style.percent}>
                        <PercentageCircle percentage={50} />
                    </div>
                    <div className={Style.stake}>
                        <div className={`flex items-center ${Style["total-stakes"]} gap-1 justify-center`}>
                            <span id="tie-coin-icon" className="icon-coin"></span>
                            <span id="tie-total-stakes">{gameStateContext?.totalBets["tie"]}</span>
                        </div>
                        <div className="flex items-center players gap-1 justify-center">
                            <span id="tie-user-icon" className="icon-user"></span>
                            <span id="tie-no">{dataTie.players}</span>
                        </div>
                    </div>
                    <div id="tie-bet-name" className="bet-name text-center mt-4">
                        {dataTie.betChoice}
                    </div>
                    <div id="tie-odds" className="bet-odds text-center">
                        {gameStateContext?.gameConfigs?.odds["tie"]}
                    </div>
                    <div className={`own-bet ${Style["own-bet"]}`}>
                        {gameStateContext?.ownBets["tie"] ? (
                            <span id="tie-own-bet" className="bet-value">
                                {gameStateContext?.ownBets["tie"]}
                            </span>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return <div>Loading....</div>;
};
