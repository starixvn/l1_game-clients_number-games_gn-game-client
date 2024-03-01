import { Resource, Texture } from "pixi.js";
import { FC, useEffect, useState } from "react";

import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { IBallColor } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { BacBallResultSlotContainer } from "./bac-ball-result-slot-container";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./constants";

export const BacBallResultBlock: FC = () => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [], blue2: [], red2: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);
    const { result, roundState, playResultAnimation } = useGameStateContext();

    useEffect(() => {
        const handleLoadResource = async () => {
            if (
                cageBallFrames.blue.length === 0 &&
                cageBallFrames.red.length === 0 &&
                cageBallFrames.blue2.length === 0 &&
                cageBallFrames.red2.length === 0
            ) {
                await loadPixiAnimations("/static/images/cage/ball.json", (sprite) => {
                    const blueFrames = sprite.animations["blue"];
                    const redFrames = sprite.animations["red"];
                    const blue2Frames = sprite.animations["blue2"];
                    const red2Frames = sprite.animations["red2"];
                    setCageBallFrames({ blue: blueFrames, red: redFrames, blue2: blue2Frames, red2: red2Frames });
                });
            }

            if (cageBallsLoopFrames.length === 0) {
                await loadPixiAnimations("/static/images/cage/cage-balls.json", (sprite) => {
                    setCageBallsLoopFrames(sprite.animations["loop"]);
                });
            }
        };

        handleLoadResource();
    }, [
        cageBallFrames.blue.length,
        cageBallFrames.red.length,
        cageBallFrames.blue2.length,
        cageBallFrames.red2.length,
        cageBallsLoopFrames.length,
    ]);

    if (
        cageBallsLoopFrames?.length === 0 ||
        cageBallFrames?.blue?.length === 0 ||
        cageBallFrames?.red?.length === 0 ||
        cageBallFrames?.blue2?.length === 0 ||
        cageBallFrames?.red2?.length === 0
    ) {
        return <></>;
    }

    const bankerDelayTime = 1000;

    return (
        <div className={Style["result-container"]}>
            <div className={Style["player-container"]}>
                <div className={Style["lottery-player-container"]}>
                    <Cage
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.BLUE}
                        position={CagePosition.LEFT}
                        isSmall={true}
                        result={result?.player}
                        isShowResult={playResultAnimation}
                    />
                </div>
                <BacBallResultSlotContainer delayTime={0} betChoice={BacBallBetOptions.PLAYER} />
            </div>
            <div className={Style["player-container"]}>
                <BacBallResultSlotContainer delayTime={bankerDelayTime} betChoice={BacBallBetOptions.BANKER} />
                <div className="lottery">
                    <Cage
                        cageBallsLoopFrames={cageBallsLoopFrames}
                        cageBallFrames={cageBallFrames}
                        color={CageColor.RED}
                        position={CagePosition.RIGHT}
                        isSmall={true}
                        result={result?.banker}
                        isShowResult={playResultAnimation}
                        delayShowResultTime={bankerDelayTime}
                    />
                </div>
            </div>
        </div>
    );
};
