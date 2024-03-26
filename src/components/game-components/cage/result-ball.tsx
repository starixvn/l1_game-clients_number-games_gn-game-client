import { AnimatedSprite, Container, Stage } from "@pixi/react";
import React, { useMemo } from "react";

import { IBallColor, RoundState } from "../../game-base/type";
import Styles from "./cage.module.scss";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    roundState: RoundState;
    cageBallFrames: IBallColor;
    ballColor: string;
    ballSpeed: number;
    isShowResultAnim: boolean;
}> = ({ isDelayShowResult, roundState, cageBallFrames, ballColor, ballSpeed, isShowResultAnim }) => {
    const currentTime = Date.now();

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
                                    initialFrame={isShowResultAnim ? 0 : cageBallFrames[ballColor]?.length - 1}
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
    }, [isDelayShowResult, roundState, cageBallFrames, ballColor]);
};

export default ResultBall;
