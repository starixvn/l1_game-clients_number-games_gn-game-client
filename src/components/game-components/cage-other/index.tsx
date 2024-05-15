import Image from "next/image";
import React, { memo, useCallback, useEffect, useState } from "react";

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
    initialDelayBallTime,
}) => {
    const [showBalls, setShowBalls] = useState(false);
    const [totalPoint, setTotalPoint] = useState(0);

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

    const incrementTotalPoint = useCallback((point: number, pos: number) => {
        const timeOut = setTimeout(() => {
            setTotalPoint((currentTotalPoint) => currentTotalPoint + point);
        }, 700 + pos * 80);

        return () => {
            clearTimeout(timeOut);
        };
    }, []);

    const getBallDelayTime = (pos: number) => {
        return pos * (initialDelayBallTime ?? 450) + 80;
    };

    const showResult = () => {
        if (!listResult) {
            return <></>;
        }

        return listResult.map((result, i) => {
            const ballPos = i + 1;
            const delayTime = getBallDelayTime(ballPos);

            return (
                <ResultBallOther
                    key={result}
                    ballPos={ballPos}
                    isShowResultAnim={playResultAnimation}
                    fps={ballFPS}
                    number={result}
                    gameFolder={"se-ball"}
                    width={596}
                    height={180}
                    delayTime={delayTime}
                    incrementTotalPoint={incrementTotalPoint}
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

            {playResultAnimation && (
                <Image
                    width={120}
                    height={120}
                    className={`${CageStyles["ball-blur"]} ${Styles["ball-blur"]}`}
                    src={`/static/images/cage/ball-blur.webp`}
                    alt="img-blur"
                />
            )}

            {playResultAnimation && showBalls && totalPoint > 0 && <div className={Styles["total-point"]}>{totalPoint}</div>}

            {playResultAnimation && showBalls && showResult()}
        </div>
    );
};

export default memo(OtherCage);
