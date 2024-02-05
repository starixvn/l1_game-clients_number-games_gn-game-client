import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import React, { useMemo } from "react";

import { IBallColor } from "../../game-base/type";
import Styles from "./cage.module.scss";

export enum CageColor {
    Blue = "blue",
    Red = "red",
    Purple = "purple",
}

export enum BallColor {
    Blue = "blue",
    Red = "red",
}

export enum CagePosition {
    Left = "left",
    Right = "right",
}

export type CageProps = {
    color: string;
    ballColor: string;
    isSmall: boolean;
    cageBallsLoopFrames: Texture<Resource>[];
    cageBallFrames: IBallColor;
    isPlayAnim: boolean;
};

const Cage: React.FunctionComponent<CageProps> = (cageProps) => {
    const { color, ballColor, isSmall, cageBallsLoopFrames, cageBallFrames, isPlayAnim } = cageProps;
    const lidPosition = color === CageColor.Red ? "left" : "right";

    return useMemo(() => {
        return (
            <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[lidPosition]}`}>
                <div id="cage-bg" className={Styles["cage-bg"]}></div>
                <div id="cage-balls" className={Styles["cage-balls"]}>
                    {cageBallsLoopFrames.length > 0 && (
                        <Stage width={130} height={130} options={{ backgroundAlpha: 0 }}>
                            <Container position={[65, 65]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={cageBallsLoopFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.6}
                                    loop={true}
                                />
                            </Container>
                        </Stage>
                    )}
                </div>
                <div id="cage-cover" className={Styles["cage-cover"]}></div>
                <div id="cage-border" className={`${Styles["cage-border"]} ${Styles[color]}`}>
                    {!isPlayAnim && <div id="cage-lid" className={Styles["cage-lid"]} />}

                    {isPlayAnim && (
                        <div id="show-ball-anim" className={Styles["show-ball-anim"]}>
                            {cageBallFrames[ballColor].length > 0 && (
                                <Stage width={250} height={250} options={{ backgroundAlpha: 0 }}>
                                    <Container position={[85, 86]}>
                                        <AnimatedSprite
                                            anchor={0.5}
                                            textures={cageBallFrames[ballColor]}
                                            autoUpdate
                                            isPlaying={true}
                                            initialFrame={0}
                                            animationSpeed={0.3}
                                            loop={false}
                                        />
                                    </Container>
                                </Stage>
                            )}
                        </div>
                    )}
                </div>

                {isPlayAnim && (
                    <div id="result-text" className={`${Styles["number"]} ${isPlayAnim ? Styles["show"] : Styles["hide"]}`}>
                        38
                    </div>
                )}
            </div>
        );
    }, [isPlayAnim]);
};

export default Cage;
