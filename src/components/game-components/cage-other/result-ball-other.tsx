import React, { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { getBallColor } from "../../../_shared/helpers/ball-color-helper";
import { useShowBallResultSound } from "../../../_shared/react-hooks";
import ResultNumber from "../cage/result-number";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-other.module.scss";

const ResultBallOther: React.FC<{
    ballPos: number;
    isShowResultAnim: boolean;
    gameFolder: string;
    width: number;
    height: number;
    fps?: number;
    number?: number;
    duration?: number;
}> = ({ ballPos, isShowResultAnim, gameFolder, width, height, fps, number, duration }) => {
    const playShowBallResult = useShowBallResultSound();
    const color = getBallColor(number);
    const ballName = `ball-${color}-pos-${ballPos}`;

    return useMemo(() => {
        isShowResultAnim && playShowBallResult();

        return (
            <div key={uuidv4()} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                <Spritesheet
                    className={`${Styles["ball-result"]}`}
                    image={`/static/images/${gameFolder}/result-ball/${ballName}.webp`}
                    widthFrame={width}
                    isResponsive
                    heightFrame={height}
                    steps={2}
                    autoplay
                    fps={fps ?? 30}
                />
                <BallRotation
                    fps={fps}
                    ballPos={ballPos}
                    number={number}
                    isShowResultAnim={isShowResultAnim}
                    duration={duration}
                    color={color}
                />
            </div>
        );
    }, [ballPos]);
};

const BallRotation: React.FC<{
    ballPos: number;
    fps: number;
    number: number;
    isShowResultAnim: boolean;
    duration: number;
    color: string;
}> = ({ ballPos, fps, number, isShowResultAnim, duration, color }) => {
    const delayTime = ballPos * (duration ?? 700) + 300;
    const [showBall, setShowBall] = useState(false);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        timeOut = setTimeout(() => {
            setShowBall(true);
        }, delayTime);

        return () => {
            clearTimeout(timeOut);
        };
    }, [ballPos]);

    if (!showBall) {
        return <></>;
    }

    return (
        <div className={Styles[`ball-rotation-${ballPos}`]}>
            <Spritesheet
                image={`/static/images/cage/ball-${color}-middle-light.webp`}
                widthFrame={153}
                isResponsive
                heightFrame={153}
                steps={8}
                autoplay
                fps={fps ?? 30}
                startAt={0}
                endAt={31}
            />
            <ResultNumber
                className={Styles["number"]}
                isDelayShowResult={true}
                number={number.toString()}
                isShowResultAnim={isShowResultAnim}
                fps={fps}
            />
        </div>
    );
};

export default ResultBallOther;
