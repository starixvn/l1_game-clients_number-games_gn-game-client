import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import React, { useEffect } from "react";

import Styles from "./animated-bingo.module.scss";

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
};

const Cage: React.FunctionComponent<CageProps> = (cageProps) => {
    const [playAnim, setPlayAnim] = React.useState(false);
    const [cageLoopFrames, setCageLoopFrames] = React.useState<Texture<Resource>[]>([]);
    const [ballFrames, setBallFrames] = React.useState<Texture<Resource>[]>([]);
    const { color, ballColor, isSmall } = cageProps;
    const lidPosition = color === CageColor.Red ? "left" : "right";

    useEffect(() => {
        const loadAndSetFrames = async (url: string, animationKey: string, setFramesCallback) => {
            const sprite = await Assets.load<Spritesheet>(url);
            setFramesCallback(sprite.animations[animationKey]);
        };

        const loadCageLoopsJson = () => {
            loadAndSetFrames("/images/animated-bingo/cage-balls.json", "loop", setCageLoopFrames);
        };

        const loadDrumBallJson = () => {
            loadAndSetFrames("/images/animated-bingo/ball.json", ballColor, setBallFrames);
        };

        loadCageLoopsJson();
        loadDrumBallJson();
    }, []);

    const renderButtonPlay = () => {
        return (
            <button className={Styles["button"]} onClick={() => setPlayAnim(!playAnim)}>
                {!playAnim ? "Play result" : "Reset result"}
            </button>
        );
    };

    if (cageLoopFrames && cageLoopFrames.length > 0 && ballFrames && ballFrames.length > 0) {
        return (
            <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""}`}>
                <div className={Styles["cage-bg"]}></div>
                <div className={Styles["cage-balls"]}>
                    {playAnim && (
                        <Stage width={130} height={130} options={{ backgroundAlpha: 0 }}>
                            <Container position={[65, 65]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={cageLoopFrames}
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
                <div className={Styles["cage-cover"]}></div>
                <div className={`${Styles["cage-border"]} ${Styles[color]}`}>
                    {playAnim && (
                        <div className={Styles[lidPosition]}>
                            <Stage width={153} height={153} options={{ backgroundAlpha: 0 }}>
                                <Container position={[85, 86]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={ballFrames}
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
                {playAnim && <div className={`${Styles["number"]} ${playAnim ? Styles["show"] : Styles["hide"]}}`}>38</div>}

                {renderButtonPlay()}
            </div>
        );
    } else {
        return null;
    }
};

export default Cage;
