import Image from "next/image";
import React, { memo, useCallback, useEffect, useState } from "react";

import { RoundState } from "../../game-base/type";
import { CageProps } from "../cage";
import BallLoops from "../cage/ball-loop";
import CageStyles from "../cage/cage.module.scss";
import Styles from "./cage-result-list.module.scss";
import ResultEachBall from "./result-each-ball";

const CageResultList: React.FC<CageProps> = ({
    position,
    isSmall,
    color,
    playResultAnimation,
    ballFPS,
    isPlayStartRoundAnimation,
    listResult,
    roundState,
    initialBallDelayTime,
}) => {
    const [showBalls, setShowBalls] = useState(false);
    const [totalPoint, setTotalPoint] = useState(0);

    const showBallDelayTime = 1200;

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!showBalls && roundState === RoundState.DisplayResult) {
            timeOut = setTimeout(
                () => {
                    setShowBalls(true);
                },
                playResultAnimation ? showBallDelayTime : 0
            );
        }

        return () => {
            clearTimeout(timeOut);
        };
    });

    const incrementTotalPoint = useCallback((point: number, pos: number) => {
        setTotalPoint((currentTotalPoint) => currentTotalPoint + point);
    }, []);

    const showResult = () => {
        if (!listResult) {
            return <></>;
        }

        return listResult.map((result, i) => {
            const ballRotationDelayTime = 80;
            const defaultBallDelayTime = 450;
            const ballPos = i + 1;
            const delayTime = playResultAnimation ? ballPos * (initialBallDelayTime ?? defaultBallDelayTime) + ballRotationDelayTime : 0;

            return (
                <ResultEachBall
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
            <div className={`${Styles["ball"]} ${totalPoint > 0 ? Styles["hide-ball"] : ""}`}>
                <div id="cage-bg" className={CageStyles["cage-bg"]}></div>
                <BallLoops isPlayStartRoundAnimation={isPlayStartRoundAnimation} />
                <div id="cage-cover" className={CageStyles["cage-cover"]}></div>
                <div id="cage-border" className={`${CageStyles["cage-border"]} ${CageStyles[color]}`}>
                    {!playResultAnimation && <div id="cage-lid" className={CageStyles["cage-lid"]} />}
                </div>

                {playResultAnimation && (
                    <Image
                        width={140}
                        height={140}
                        className={`${CageStyles["ball-blur"]} ${Styles["ball-blur"]}`}
                        src={`/static/images/cage/cage-border-purple-blur.webp?v=2`}
                        alt="img-blur"
                    />
                )}
            </div>
            {showBalls && totalPoint > 0 && <div className={`${Styles["total-point"]} `}>{totalPoint}</div>}

            {showBalls && showResult()}
        </div>
    );
};

export default memo(CageResultList);
