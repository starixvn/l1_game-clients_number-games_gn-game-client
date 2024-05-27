import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { useShowBallResultSound } from "../../../_shared/react-hooks";
import ResultNumber from "../cage/result-number";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-result-list.module.scss";

const BallRotation: React.FC<{
    ballPos: number;
    number: number;
    isShowResultAnim: boolean;
    delayTime: number;
    color: string;
    incrementTotalPoint: Function;
}> = ({ ballPos, number, isShowResultAnim, delayTime, color, incrementTotalPoint }) => {
    const [showBall, setShowBall] = useState(false);
    const playShowBallResult = useShowBallResultSound();

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

    return useMemo(() => {
        isShowResultAnim && playShowBallResult();

        if (!showBall) {
            return <></>;
        }

        return (
            <div key={uuidv4()} className={Styles[`ball-rotation-${ballPos}`]}>
                <Spritesheet
                    image={`/static/images/cage/ball-${color}-middle-light.webp`}
                    widthFrame={153}
                    isResponsive
                    heightFrame={153}
                    steps={8}
                    autoplay
                    fps={30}
                    startAt={isShowResultAnim ? 0 : 31}
                    endAt={31}
                />
                <ResultNumber
                    className={Styles["number"]}
                    isDelayShowResult={true}
                    number={number.toString()}
                    isShowResultAnim={isShowResultAnim}
                    fps={30}
                />
            </div>
        );
    }, [number, showBall]);
};

export default BallRotation;
