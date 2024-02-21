import { Resource, Texture } from "pixi.js";
import { FC, useEffect, useState } from "react";

import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { IBallColor } from "../../components/game-base/type";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
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
    const { result, roundData, drawId, turnCounter } = gameStateContext;
    // const turn = drawId % 4 === 0 ? 4 : drawId % 4;
    const { bankerBalls, playerBalls } = roundData as any;

    useEffect(() => {
        if (cageBallFrames.blue.length === 0 && cageBallFrames.red.length === 0) {
            loadPixiAnimations("/static/images/cage/ball.json", (sprite) => {
                const blueFrames = sprite.animations["blue"];
                const redFrames = sprite.animations["red"];
                setCageBallFrames({ blue: blueFrames, red: redFrames });
            });
        }

        if (cageBallsLoopFrames.length === 0) {
            loadPixiAnimations("/static/images/cage/cage-balls.json", (sprite) => {
                setCageBallsLoopFrames(sprite.animations["loop"]);
            });
        }
    }, [cageBallFrames.blue.length, cageBallFrames.red.length, cageBallsLoopFrames.length]);

    useEffect(() => {
        const updatedPlayerList = [];
        if (turnCounter !== 1) {
            for (let i = 0; i < existedPlayerBalls.length; i++) {
                updatedPlayerList[i] = playerBalls?.length > 0 && playerBalls[i] ? playerBalls[i] : existedPlayerBalls[i];
            }
            result && result.player && (updatedPlayerList[turnCounter - 1] = result.player);
            setExistedPlayerBalls(updatedPlayerList);
        } else {
            setExistedPlayerBalls([0, 0, 0, 0]);
        }
    }, [turnCounter, playerBalls]);

    useEffect(() => {
        const updatedBankerList = [];
        if (turnCounter !== 1) {
            for (let i = 0; i < existedBankerBalls.length; i++) {
                updatedBankerList[i] = bankerBalls?.length > 0 && bankerBalls[i] ? bankerBalls[i] : existedBankerBalls[i];
            }
            result && result.banker && (updatedBankerList[turnCounter - 1] = result.banker);
            setExistedBankerBalls(updatedBankerList);
        } else {
            setExistedBankerBalls([0, 0, 0, 0]);
        }
    }, [turnCounter, bankerBalls]);

    if (!result || cageBallsLoopFrames?.length === 0 || cageBallFrames?.blue?.length === 0 || cageBallFrames?.red?.length === 0) {
        return <></>;
    }

    const bankerDelayTime = 1000;

    const renderBalls = (updatedPlayerList) => {
        return (
            <div>
                {updatedPlayerList.map((result, index) => {
                    const order = index + 1;
                    const props: any = {};
                    if (result && turnCounter !== order) {
                        props.number = result;
                    } else if (turnCounter === order) {
                        props.isLoading = true;
                        props.number = result;
                    } else if (result === 0) {
                        props.isEmpty = true;
                    }

                    return <Ball key={order} {...props} />;
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
                        color={CageColor.Blue}
                        ballColor={BallColor.Blue}
                        isSmall={true}
                        result={result.player}
                        isShowResult={gameStateContext.playResultAnimation}
                    />
                </div>
                <div className={Style["ball-container"]}>{renderBalls(existedPlayerBalls)}</div>
            </div>
            <div className={Style["player-container"]}>
                <div className={Style["ball-container"]}>{renderBalls(existedBankerBalls)}</div>
                <div className="lottery">
                    <Cage
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.Red}
                        ballColor={BallColor.Red}
                        isSmall={true}
                        result={result.banker}
                        isShowResult={gameStateContext.playResultAnimation}
                        delayShowResultTime={bankerDelayTime}
                    />
                </div>
            </div>
        </div>
    );
};
