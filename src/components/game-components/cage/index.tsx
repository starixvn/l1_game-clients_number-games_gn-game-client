import React, { memo, useEffect, useState } from "react";

import { getBallColor } from "../../../_shared/helpers/ball-color-helper";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import BallLoops from "./ball-loop";
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
    CENTER = "center",
}

export type CageProps = {
    color: string;
    isSmall: boolean;
    result: number;
    delayShowResultTime?: number;
    position: string;
    highlight?: boolean;
    ballFPS?: number;
    isPlayStartRoundAnimation?: boolean;
} & Partial<GameStateContextModel>;

const Cage: React.FC<CageProps> = ({
    position,
    isSmall,
    result,
    delayShowResultTime,
    color,
    playResultAnimation,
    roundState,
    highlight,
    ballFPS,
    isPlayStartRoundAnimation,
}) => {
    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);
    const [ballColor, setBallColor] = useState<string>(null);

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

    useEffect(() => {
        !!result && setBallColor(`ball-${getBallColor(result)}-${position === CagePosition.RIGHT ? "2" : "1"}`);
    }, [result]);

    return (
        <div className={`${Styles["cage-area"]} ${isSmall ? Styles["small"] : ""} ${Styles[position]}`}>
            {highlight && <div className={`${Styles["cage-bg-highlight"]}`}></div>}
            <div id="cage-bg" className={Styles["cage-bg"]}></div>
            <BallLoops isPlayStartRoundAnimation={isPlayStartRoundAnimation} />
            <div id="cage-cover" className={Styles["cage-cover"]}></div>
            <div id="cage-border" className={`${Styles["cage-border"]} ${Styles[color]}`}>
                {!isDelayShowResult && <div id="cage-lid" className={Styles["cage-lid"]} />}

                {!!ballColor && (
                    <ResultBall
                        isDelayShowResult={isDelayShowResult}
                        ballColor={ballColor}
                        isShowResultAnim={playResultAnimation}
                        fps={ballFPS}
                    />
                )}
            </div>

            {!!result && (
                <ResultNumber isDelayShowResult={isDelayShowResult} number={result} isShowResultAnim={playResultAnimation} fps={ballFPS} />
            )}
        </div>
    );
};

export default memo(Cage);
