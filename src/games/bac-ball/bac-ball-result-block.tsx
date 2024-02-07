import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import Style from "./bac-ball.module.scss";
import { IBallColor } from "../../components/game-base/type";
import { FC, useEffect, useState } from "react";
import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";

export type ResultBlockProps = {
    messageTransmitter: MessageTransmitterType;
    getGameState: () => any;
};

export const BacBallResultBlockFC: FC<ResultBlockProps> = (props) => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);

    useEffect(() => {
        if (cageBallFrames.blue.length === 0 && cageBallFrames.red.length === 0) {
            const spriteUrl = "/static/images/cage/ball.json";
            Assets.load<Spritesheet>(spriteUrl).then((sprite) => {
                const blueFrames = sprite.animations["blue"];
                const redFrames = sprite.animations["red"];
                setCageBallFrames({ blue: blueFrames, red: redFrames });
            });

            console.log(spriteUrl);
        }
    }, [cageBallFrames.blue.length, cageBallFrames.red.length]);

    useEffect(() => {
        if (cageBallsLoopFrames.length === 0) {
            const spriteUrl = "/static/images/cage/cage-balls.json";

            Assets.load<Spritesheet>("/static/images/cage/cage-balls.json").then((sprite) => {
                setCageBallsLoopFrames(sprite.animations["loop"]);
            });

            console.log(spriteUrl);
        }
    }, [cageBallsLoopFrames.length]);

    // waiting for rounduration class
    const parentState = props.getGameState();

    if (
        !parentState.result ||
        cageBallsLoopFrames?.length === 0 ||
        cageBallFrames?.blue?.length === 0 ||
        cageBallFrames?.red?.length === 0
    ) {
        return <></>;
    }

    const { player, banker } = parentState.result;

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
                        result={player}
                        isShowResult={parentState.playResultAnimation}
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
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.Red}
                        ballColor={BallColor.Red}
                        isSmall={true}
                        result={banker}
                        isShowResult={parentState.playResultAnimation}
                        delayShowResultTime={1000}
                    />
                </div>
            </div>
        </div>
    );
};
