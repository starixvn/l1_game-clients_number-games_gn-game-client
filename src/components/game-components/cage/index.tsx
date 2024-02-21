import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import React, { useEffect, useMemo, useState } from "react";

import { loadPixiAnimations } from "../../../_shared/helpers/pixi-resource-loader";
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
    result: number;
    isShowResult: boolean;
    delayShowResultTime?: number;
};

const Cage: React.FunctionComponent<CageProps> = (cageProps) => {
    const { color, ballColor, isSmall, cageBallsLoopFrames, cageBallFrames, result, isShowResult, delayShowResultTime } = cageProps;
    const lidPosition = color === CageColor.Blue ? "left" : "right";
    const animName = result <= 9 ? `number0${result}` : `number${result}`;

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);
    const [numberBallFrames, setNumberBallFrames] = useState<Texture<Resource>[]>([]);

    useEffect(() => {
        result &&
            loadPixiAnimations(`/static/images/cage/number/${result}.json`, (sprite) => {
                setNumberBallFrames(sprite.animations[animName]);
            });
    }, [numberBallFrames.length]);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        if (isShowResult) {
            timeOut = setTimeout(() => setIsDelayShowResult(true), delayShowResultTime);
        } else {
            setIsDelayShowResult(false);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayShowResultTime, isShowResult]);

    const showResultBall = () => {
        if (!isDelayShowResult || !isShowResult) {
            return <></>;
        }
        return (
            <div id="show-ball-anim" className={Styles["show-ball-anim"]}>
                {cageBallFrames && cageBallFrames[ballColor].length > 0 && (
                    <Stage width={250} height={250} options={{ backgroundAlpha: 0 }}>
                        <Container position={[82, 85]}>
                            <AnimatedSprite
                                anchor={0.5}
                                textures={cageBallFrames[ballColor]}
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
        );
    };

    const showResultNumber = () => {
        if (!isDelayShowResult || !isShowResult || numberBallFrames?.length === 0) {
            return <></>;
        }

        return (
            <div id="result-text" className={Styles["number"]}>
                <Stage width={153} height={153} options={{ backgroundAlpha: 0 }}>
                    <Container position={[82, 85]}>
                        <AnimatedSprite
                            anchor={0.5}
                            textures={numberBallFrames}
                            autoUpdate
                            isPlaying={true}
                            initialFrame={0}
                            animationSpeed={0.6}
                            loop={false}
                        />
                    </Container>
                </Stage>
            </div>
        );
    };

    return useMemo(() => {
        return (
            <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[lidPosition]}`}>
                <div id="cage-bg" className={Styles["cage-bg"]}></div>
                <div id="cage-balls" className={Styles["cage-balls"]}>
                    {cageBallsLoopFrames?.length > 0 && (
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
                    {!isDelayShowResult && <div id="cage-lid" className={Styles["cage-lid"]} />}

                    {showResultBall()}
                </div>

                {showResultNumber()}
            </div>
        );
    }, [isShowResult, isDelayShowResult]);
};

export default Cage;
