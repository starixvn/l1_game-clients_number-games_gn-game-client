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
import { Spritesheet } from "../sprites-sheet";

export enum CageColor {
    BLUE = "blue",
    RED = "red",
    PURPLE = "purple",
}

export enum CagePosition {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
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
                {roundState === RoundState.SwitchRound && <div className={Styles["idle-balls"]}></div>}
                {cageBallsLoopFrames?.length > 0 && roundState !== RoundState.SwitchRound && (
                    <Spritesheet
                        className={`cage-loop__class--style`}
                        image={`/static/images/bac-number/cage-loop-anim.png`}
                        widthFrame={130}
                        isResponsive
                        heightFrame={130}
                        steps={11}
                        autoplay={true}
                        loop={true}
                        fps={30}
                    />
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
                    ballSpeed={ballSpeed}
                    isShowResultAnim={playResultAnimation}
                />
            </div>

            <ResultNumber
                isDelayShowResult={isDelayShowResult}
                roundState={roundState}
                numberBallFrames={numberBallFrames}
                ballSpeed={ballSpeed}
                isShowResultAnim={playResultAnimation}
            />
        </div>
    );
};

export default Cage;
