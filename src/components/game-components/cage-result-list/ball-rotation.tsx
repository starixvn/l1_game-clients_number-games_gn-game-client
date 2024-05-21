import { useEffect, useState } from "react";

import ResultNumber from "../cage/result-number";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-result-list.module.scss";

const BallRotation: React.FC<{
    ballPos: number;
    fps: number;
    number: number;
    isShowResultAnim: boolean;
    delayTime: number;
    color: string;
    incrementTotalPoint?: Function;
}> = ({ ballPos, fps, number, isShowResultAnim, delayTime, color, incrementTotalPoint }) => {
    const [showBall, setShowBall] = useState(false);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setShowBall(true);
        }, delayTime);

        const ballRotationTime = 1000;
        const timeOutTotalPoint = setTimeout(() => {
            incrementTotalPoint(number, ballPos);
        }, delayTime + ballRotationTime);

        return () => {
            clearTimeout(timeOut);
            clearTimeout(timeOutTotalPoint);
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
                fps={fps ?? 40}
                startAt={isShowResultAnim ? 0 : 31}
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

export default BallRotation;
