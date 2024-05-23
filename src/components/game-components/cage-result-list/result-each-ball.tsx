import React, { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { getBallColor } from "../../../_shared/helpers/ball-color-helper";
import { useShowBallResultSound } from "../../../_shared/react-hooks";
import { Spritesheet } from "../sprites-sheet";
import BallRotation from "./ball-rotation";
import Styles from "./cage-result-list.module.scss";

const ResultEachBall: React.FC<{
    ballPos: number;
    isShowResultAnim: boolean;
    gameFolder: string;
    width: number;
    height: number;
    fps?: number;
    number?: number;
    delayTime?: number;
    incrementTotalPoint?: Function;
}> = ({ ballPos, isShowResultAnim, gameFolder, width, height, fps, number, delayTime, incrementTotalPoint }) => {
    const playShowBallResult = useShowBallResultSound();
    const color = getBallColor(number);
    const ballName = `ball-${color}-pos-${ballPos}`;

    return useMemo(() => {
        isShowResultAnim && playShowBallResult();

        return (
            <div key={uuidv4()} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                {/* {isShowResultAnim && (
                    <Spritesheet
                        className={`${Styles["ball-result"]}`}
                        image={`/static/images/${gameFolder}/result-ball/${ballName}.webp?v=1`}
                        widthFrame={width}
                        isResponsive
                        heightFrame={height}
                        steps={2}
                        autoplay
                        fps={fps ?? 40}
                    />
                )} */}
                <BallRotation
                    fps={fps}
                    ballPos={ballPos}
                    number={number}
                    isShowResultAnim={isShowResultAnim}
                    delayTime={delayTime}
                    color={color}
                    incrementTotalPoint={incrementTotalPoint}
                />
            </div>
        );
    }, [ballPos]);
};

export default ResultEachBall;
