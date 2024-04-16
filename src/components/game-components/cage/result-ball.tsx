import React, { useMemo } from "react";

import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    ballColor: string;
    isShowResultAnim: boolean;
    fps?: number;
}> = ({ isDelayShowResult, ballColor, isShowResultAnim, fps }) => {
    const currentTime = Date.now();
    return useMemo(() => {
        if (!isDelayShowResult) {
            return null;
        }

        const ballImage = ballColor.includes("blue") ? "blue" : "red";

        return (
            <div key={currentTime} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                {isShowResultAnim ? (
                    <Spritesheet
                        className={"sss"}
                        image={`/static/images/preload-resources/${ballColor}.png`}
                        widthFrame={153}
                        isResponsive
                        heightFrame={153}
                        steps={8}
                        autoplay={true}
                        loop={false}
                        fps={fps ?? 30}
                        startAt={0}
                        endAt={31}
                    />
                ) : (
                    <img className={"sss"} src={`/static/images/preload-resources/${ballImage}.png`} alt="img-result" />
                )}
            </div>
        );
    }, [isDelayShowResult, ballColor, isShowResultAnim]);
};

export default ResultBall;
