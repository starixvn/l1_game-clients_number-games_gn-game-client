import { Resource, Texture } from "pixi.js";
import Ball from "../../components/game-components/ball";
import Cage, { BallColor, CageColor } from "../../components/game-components/cage";
import Style from "./bac-ball.module.scss";
import { IBallColor } from "../../components/game-base/type";
import { FC, useContext, useEffect, useState } from "react";
import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { GameContext } from "../../_shared/react-contexts";

export const BacBallResultBlock: FC = () => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);
    const gameContext = useContext(GameContext);

    useEffect(() => {
        loadPixiAnimations("/static/images/cage/ball.json", (sprite) => {
            const blueFrames = sprite.animations["blue"];
            const redFrames = sprite.animations["red"];
            setCageBallFrames({ blue: blueFrames, red: redFrames });
        });
    }, [cageBallFrames.blue.length, cageBallFrames.red.length]);

    useEffect(() => {
        loadPixiAnimations("/static/images/cage/cage-balls.json", (sprite) => {
            setCageBallsLoopFrames(sprite.animations["loop"]);
        });
    }, [cageBallsLoopFrames.length]);

    // waiting for rounduration class
    const gameResult = gameContext.result;

    if (!gameResult || cageBallsLoopFrames?.length === 0 || cageBallFrames?.blue?.length === 0 || cageBallFrames?.red?.length === 0) {
        return <></>;
    }

    const { player, banker } = gameResult as { player: number; banker: number };

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
                        isShowResult={gameContext.playResultAnimation}
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
                        isShowResult={gameContext.playResultAnimation}
                        delayShowResultTime={1000}
                    />
                </div>
            </div>
        </div>
    );
};
