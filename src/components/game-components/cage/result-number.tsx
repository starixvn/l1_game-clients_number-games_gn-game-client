import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import React, { useMemo } from "react";

import { RoundState } from "../../game-base/type";
import Styles from "./cage.module.scss";

const ResultNumber: React.FC<{
    isDelayShowResult: boolean;
    roundState: RoundState;
    numberBallFrames: Texture<Resource>[];
    ballSpeed: number;
    isShowResultAnim: boolean;
}> = ({ isDelayShowResult, roundState, numberBallFrames, ballSpeed, isShowResultAnim }) => {
    const currentTime = Date.now();

    return useMemo(() => {
        if (isDelayShowResult && roundState === RoundState.DisplayResult && numberBallFrames?.length !== 0) {
            return (
                <div key={currentTime} id="result-text" className={Styles["number"]}>
                    <Stage
                        key={currentTime}
                        width={153}
                        height={153}
                        options={{ backgroundAlpha: 0, antialias: false, powerPreference: "low-power" }}
                    >
                        <Container key={currentTime} position={[82, 85]}>
                            <AnimatedSprite
                                anchor={0.5}
                                textures={numberBallFrames}
                                autoUpdate
                                isPlaying={true}
                                initialFrame={isShowResultAnim ? 0 : numberBallFrames.length - 1}
                                animationSpeed={ballSpeed}
                                loop={false}
                            />
                        </Container>
                    </Stage>
                </div>
            );
        } else {
            return <></>;
        }
    }, [isDelayShowResult, roundState, numberBallFrames]);
};

export default ResultNumber;
