import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import React, { useEffect, useMemo } from "react";

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
};

const Cage: React.FunctionComponent<CageProps> = (cageProps) => {
    const [playAnim, setPlayAnim] = React.useState(false);
    const { color, ballColor, isSmall, cageBallsLoopFrames, cageBallFrames } = cageProps;
    const lidPosition = color === CageColor.Red ? "left" : "right";

    const renderButtonPlay = () => {
        return (
            <button className={Styles["button"]} onClick={() => setPlayAnim(!playAnim)}>
                {!playAnim ? "Play result" : "Reset result"}
            </button>
        );
    };

    return useMemo(() => {
        return (
            <div id="cageArea" className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[lidPosition]}`}>
                <div id="cageBg" className={Styles["cage-bg"]}></div>
                <div id="cageBalls" className={Styles["cage-balls"]}>
                    {playAnim && (
                        <Stage width={130} height={130} options={{ backgroundAlpha: 0 }}>
                            <Container position={[65, 65]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={cageBallsLoopFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.6}
                                    loop={false}
                                />
                            </Container>
                        </Stage>
                    )}
                </div>
                <div id="cageCover" className={Styles["cage-cover"]}></div>
                <div id="cageBorder" className={`${Styles["cage-border"]} ${Styles[color]}`}>
                    {playAnim && (
                        <div id="cageBallAnim" className={Styles["show-ball-anim"]}>
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
                        </div>
                    )}
                </div>
                {playAnim && <div className={`${Styles["number"]} ${playAnim ? Styles["show"] : Styles["hide"]}`}>38</div>}

                {renderButtonPlay()}
            </div>
        );
    }, [playAnim]);
};

export default Cage;
