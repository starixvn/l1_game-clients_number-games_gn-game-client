import React, { useEffect, useMemo, useState } from "react";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
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
    highlight: boolean;
} & Partial<GameStateContextModel>;

const Cage: React.FC<CageProps> = (cageProps) => {
    const { position, isSmall, result, delayShowResultTime, color, playResultAnimation, roundState, highlight } = cageProps;

    const ballColor = `ball-${useBallColor({ number: result })}-${position === CagePosition.LEFT ? "1" : "2"}`;

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);

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
            <BallLoops roundState={roundState} />
            <div id="cage-cover" className={Styles["cage-cover"]}></div>
            <div id="cage-border" className={`${Styles["cage-border"]} ${Styles[color]}`}>
                {!isDelayShowResult && <div id="cage-lid" className={Styles["cage-lid"]} />}

                {result && (
                    <ResultBall
                        isDelayShowResult={isDelayShowResult}
                        roundState={roundState}
                        ballColor={ballColor}
                        isShowResultAnim={playResultAnimation}
                    />
                )}
            </div>

            {result && (
                <ResultNumber
                    isDelayShowResult={isDelayShowResult}
                    roundState={roundState}
                    number={result}
                    isShowResultAnim={playResultAnimation}
                />
            )}
        </div>
    );
};

export default Cage;
