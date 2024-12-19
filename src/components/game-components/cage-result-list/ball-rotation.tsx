import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { buildVersion } from "../../../_shared/constants";
import { useMemoriedImage, useShowBallResultSound } from "../../../_shared/react-hooks";
import ResultNumber from "../cage/result-number";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-result-list.module.scss";

const BallRotation: React.FC<{
    ballPos: number;
    number: number;
    playResultAnimation: boolean;
    delayTime: number;
    color: string;
    incrementTotalPoint: Function;
    customClassName?: string;
}> = ({ ballPos, number, playResultAnimation, delayTime, color, incrementTotalPoint, customClassName }) => {
    const [showBall, setShowBall] = useState(false);
    const playShowBallResultSound = useShowBallResultSound();
    const { data, isLoaded } = useMemoriedImage(`/static/images/anim/ball-middle/ball-${color}-middle-light.webp?v=${buildVersion}`);

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setShowBall(true);
        }, delayTime);

        const ballRotationTime = playResultAnimation ? 1000 : 0;
        const timeOutTotalPoint = setTimeout(() => {
            incrementTotalPoint(number);
        }, delayTime + ballRotationTime);

        return () => {
            clearTimeout(timeOut);
            clearTimeout(timeOutTotalPoint);
        };
    }, [ballPos]);

    return useMemo(() => {
        playResultAnimation && playShowBallResultSound();
        if (!showBall || !isLoaded) {
            return <></>;
        }

        const positionClass = `ball-rotation-${ballPos}`;

        return (
            <div key={uuidv4()} className={`${Styles[positionClass]} ${customClassName}`}>
                <Spritesheet
                    image={`/static/images/anim/ball-middle/ball-${color}-middle-light.webp?v=${buildVersion}`}
                    imageData={data}
                    widthFrame={153}
                    isResponsive
                    heightFrame={153}
                    steps={8}
                    autoplay
                    fps={30}
                    startAt={playResultAnimation ? 0 : 31}
                    endAt={31}
                />
                <ResultNumber
                    className={Styles["number"]}
                    isDelayShowResult={true}
                    number={number.toString()}
                    isShowResultAnim={playResultAnimation}
                    fps={30}
                />
            </div>
        );
    }, [number, showBall, isLoaded]);
};

export default BallRotation;
