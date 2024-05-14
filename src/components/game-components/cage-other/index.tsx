import React, { memo, useEffect, useMemo, useState } from "react";

import { RoundState } from "../../game-base/type";
import { CageProps } from "../cage";
import BallLoops from "../cage/ball-loop";
import CageStyles from "../cage/cage.module.scss";
import Styles from "./cage-other.module.scss";
import ResultBallOther from "./result-ball-other";

const OtherCage: React.FC<CageProps> = ({
    position,
    isSmall,
    color,
    playResultAnimation,
    ballFPS,
    isPlayStartRoundAnimation,
    listResult,
    roundState,
}) => {
    const [showBalls, setShowBalls] = useState(false);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!showBalls && roundState === RoundState.DisplayResult) {
            timeOut = setTimeout(() => {
                setShowBalls(true);
            }, 1200);
        }

        return () => {
            clearTimeout(timeOut);
        };
    });

    const showResult = () => {
        if (!listResult) {
            return <></>;
        }

        return listResult.map((result, i) => {
            return (
                <ResultBallOther
                    key={result}
                    ballPos={i + 1}
                    isShowResultAnim={playResultAnimation}
                    fps={ballFPS}
                    number={result}
                    gameFolder={"se-ball"}
                    width={596}
                    height={180}
                />
            );
        });
    };

    return (
        <div
            className={`${CageStyles["cage-area"]} ${isSmall ? CageStyles["small"] : ""} ${CageStyles[position]} ${
                Styles[`type-${listResult?.length}`]
            }`}
        >
            <div id="cage-bg" className={CageStyles["cage-bg"]}></div>
            <BallLoops isPlayStartRoundAnimation={isPlayStartRoundAnimation} />
            <div id="cage-cover" className={CageStyles["cage-cover"]}></div>
            <div id="cage-border" className={`${CageStyles["cage-border"]} ${CageStyles[color]}`}>
                {!playResultAnimation && <div id="cage-lid" className={CageStyles["cage-lid"]} />}
            </div>
            {playResultAnimation && showBalls && showResult()}
        </div>
    );
};

export default memo(OtherCage);
