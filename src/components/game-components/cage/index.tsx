import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import React, { useEffect, useMemo, useState } from "react";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { loadPixiAnimations } from "../../../_shared/helpers/pixi-resource-loader";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { IBallColor, RoundState } from "../../game-base/type";
import Styles from "./cage.module.scss";
import ResultBall from "./result-ball";
import ResultNumber from "./result-number";

export enum CageColor {
    BLUE = "blue",
    RED = "red",
    PURPLE = "purple",
}

export enum CagePosition {
    LEFT = "left",
    RIGHT = "right",
}

export type CageProps = {
    color: string;
    isSmall: boolean;
    cageBallsLoopFrames: Texture<Resource>[];
    cageBallFrames: IBallColor;
    result: number;
    delayShowResultTime?: number;
    position: string;
    highlight: boolean;
} & Partial<GameStateContextModel>;

const Cage: React.FC<CageProps> = (cageProps) => {
    const {
        position,
        isSmall,
        cageBallsLoopFrames,
        cageBallFrames,
        result,
        delayShowResultTime,
        color,
        playResultAnimation,
        roundState,
        highlight,
    } = cageProps;
    const animName = result <= 9 ? `number0${result}` : `number${result}`;
    const ballColor = `${useBallColor({ number: result })}${position === CagePosition.LEFT ? "" : "2"}`;
    const ballSpeed = playResultAnimation ? 0.5 : 1;
    const currentTime = Date.now();

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);
    const [numberBallFrames, setNumberBallFrames] = useState<Texture<Resource>[]>([]);

    useEffect(() => {
        if (!result) {
            return;
        }

        const handleLoadResource = async () => {
            await loadPixiAnimations(`/static/images/cage/number/${result}.json`, (sprite) => {
                setNumberBallFrames(sprite.animations[animName]);
            });
        };

        handleLoadResource();
    }, [result, animName]);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        if (playResultAnimation) {
            timeOut = setTimeout(() => setIsDelayShowResult(true), delayShowResultTime);
        } else if (roundState === RoundState.DisplayResult) {
            setIsDelayShowResult(true);
        } else {
            setIsDelayShowResult(false);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayShowResultTime, playResultAnimation, roundState]);

    return (
        <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[position]}`}>
            {highlight && <div className={`${Styles["cage-bg-highlight"]}`}></div>}
            <div id="cage-bg" className={Styles["cage-bg"]}></div>
            <div id="cage-balls" className={Styles["cage-balls"]}>
                {cageBallsLoopFrames?.length > 0 && (
                    <Stage width={130} height={130} options={{ backgroundAlpha: 0, antialias: false, powerPreference: "low-power" }}>
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
                <ResultBall
                    isDelayShowResult={isDelayShowResult}
                    roundState={roundState}
                    cageBallFrames={cageBallFrames}
                    ballColor={ballColor}
                    currentTime={currentTime}
                    ballSpeed={ballSpeed}
                    color={color}
                />
            </div>

            <ResultNumber
                isDelayShowResult={isDelayShowResult}
                roundState={roundState}
                numberBallFrames={numberBallFrames}
                currentTime={currentTime}
                ballSpeed={ballSpeed}
            />
        </div>
    );
};

export default Cage;
