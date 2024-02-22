import { Resource, Texture } from "pixi.js";
import { FC, useEffect, useState } from "react";

import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useBallColor } from "../../_shared/react-hooks/use-ball-color";
import { IBallColor, RoundState } from "../../components/game-base/type";
import Ball from "../../components/game-components/ball";
import Cage, { CageColor } from "../../components/game-components/cage";
import Style from "./bac-ball.module.scss";

export type ResultBlockProps = {
    messageTransmitter: MessageTransmitterType;
};

export const BacBallResultBlock: FC<ResultBlockProps> = (props) => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);
    const [existedPlayerBalls, setExistedPlayerBalls] = useState<Array<number>>([0, 0, 0, 0]);
    const [existedBankerBalls, setExistedBankerBalls] = useState([0, 0, 0, 0]);
    const gameStateContext = useGameStateContext();
    const { result, roundData, turnCounter } = gameStateContext;
    let playerBallColor = useBallColor({ number: result?.player });
    let bankerBallColor = useBallColor({ number: result?.banker });

    useEffect(() => {
        const handleLoadResource = async () => {
            if (cageBallFrames.blue.length === 0 && cageBallFrames.red.length === 0) {
                await loadPixiAnimations("/static/images/cage/ball.json", (sprite) => {
                    const blueFrames = sprite.animations["blue"];
                    const redFrames = sprite.animations["red"];
                    setCageBallFrames({ blue: blueFrames, red: redFrames });
                });
            }

            if (cageBallsLoopFrames.length === 0) {
                await loadPixiAnimations("/static/images/cage/cage-balls.json", (sprite) => {
                    setCageBallsLoopFrames(sprite.animations["loop"]);
                });
            }
        };

        handleLoadResource();
    }, [cageBallFrames.blue.length, cageBallFrames.red.length, cageBallsLoopFrames.length]);

    useEffect(() => {
        if (!roundData?.playerBalls?.length && !roundData?.bankerBalls?.length) {
            return;
        }

        const updatedPlayerList = [...existedPlayerBalls];
        const updatedBankerList = [...existedBankerBalls];
        const { playerBalls, bankerBalls } = roundData;

        for (let i = 0; i < existedPlayerBalls.length; i++) {
            if (playerBalls?.length > 0 && playerBalls[i]) {
                updatedPlayerList[i] = playerBalls[i];
            }
        }
        setExistedPlayerBalls(updatedPlayerList);

        for (let i = 0; i < existedBankerBalls.length; i++) {
            if (playerBalls?.length > 0 && playerBalls[i]) {
                updatedBankerList[i] = bankerBalls[i];
            }
        }
        setExistedBankerBalls(updatedBankerList);
    }, [roundData]);

    useEffect(() => {
        if (!result) {
            return;
        }

        const updatedPlayerList = [...existedPlayerBalls];
        const updatedBankerList = [...existedBankerBalls];

        if (result.player) {
            updatedPlayerList[turnCounter - 1] = result.player;
            setExistedPlayerBalls(updatedPlayerList);
        }

        if (result.banker) {
            updatedBankerList[turnCounter - 1] = result.banker;
            setExistedBankerBalls(updatedBankerList);
        }
    }, [result]);

    useEffect(() => {
        if (turnCounter === 1) {
            setExistedPlayerBalls([0, 0, 0, 0]);
            setExistedBankerBalls([0, 0, 0, 0]);
        }
    }, [turnCounter]);

    if (cageBallsLoopFrames?.length === 0 || cageBallFrames?.blue?.length === 0 || cageBallFrames?.red?.length === 0) {
        return <></>;
    }

    const bankerDelayTime = 1000;

    const renderBalls = (updatedResultList: Array<number>, delayTime = 0) => {
        return (
            <div className="flex gap-2 justify-center flex-col">
                {updatedResultList.map((result, index) => {
                    const props: any = {};

                    if (result > 0 && turnCounter !== index + 1) {
                        props.number = result;
                        props.delayTime = 0;
                        props.joinGame = true;
                    } else if (result > 0) {
                        props.number = result;
                        props.isLoading = true;
                        props.delayTime = delayTime;
                    }

                    return <Ball key={index} {...props} />;
                })}
            </div>
        );
    };

    return (
        <div className={Style["result-container"]}>
            <div className={Style["player-container"]}>
                <div className={Style["lottery-player-container"]}>
                    <Cage
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.BLUE}
                        ballColor={playerBallColor}
                        isSmall={true}
                        result={result?.player}
                        isShowResult={gameStateContext.roundState === RoundState.DisplayResult}
                    />
                </div>
                <div className={Style["ball-container"]}>{renderBalls(existedPlayerBalls)}</div>
            </div>
            <div className={Style["player-container"]}>
                <div className={Style["ball-container"]}>{renderBalls(existedBankerBalls, bankerDelayTime)}</div>
                <div className="lottery">
                    <Cage
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.RED}
                        ballColor={bankerBallColor}
                        isSmall={true}
                        result={result?.banker}
                        isShowResult={gameStateContext.roundState === RoundState.DisplayResult}
                        delayShowResultTime={bankerDelayTime}
                    />
                </div>
            </div>
        </div>
    );
};
