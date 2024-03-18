import { AnimatedSprite, Container, Stage } from "@pixi/react";
import React, { useMemo } from "react";

import { IBallColor, RoundState } from "../../game-base/type";
import Styles from "./cage.module.scss";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    roundState: RoundState;
    cageBallFrames: IBallColor;
    ballColor: string;
    currentTime: number;
    ballSpeed: number;
    color: string;
}> = ({ isDelayShowResult, roundState, cageBallFrames, ballColor, currentTime, ballSpeed, color }) => {
    return useMemo(() => {
        if (isDelayShowResult && roundState === RoundState.DisplayResult) {
            return (
                <div id="show-ball-anim" className={Styles["show-ball-anim"]}>
                    {cageBallFrames && cageBallFrames[ballColor]?.length > 0 && (
                        <Stage
                            key={currentTime}
                            width={250}
                            height={250}
                            options={{ backgroundAlpha: 0, antialias: false, powerPreference: "low-power" }}
                        >
                            <Container key={currentTime} position={[82, 85]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={cageBallFrames[ballColor]}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={ballSpeed}
                                    loop={false}
                                />
                            </Container>
                        </Stage>
                    )}
                </div>
            );
        } else {
            return <></>;
        }
    }, [isDelayShowResult, roundState, cageBallFrames]);
};

export default ResultBall;
