import React, { useMemo } from "react";

import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultNumber: React.FC<{
    isDelayShowResult: boolean;
    isShowResultAnim: boolean;
    number: string;
}> = ({ isDelayShowResult, number, isShowResultAnim }) => {
    const currentTime = Date.now();

    return useMemo(() => {
        if (isDelayShowResult) {
            return (
                <div key={currentTime} id="result-text" className={Styles["number"]}>
                    <Spritesheet
                        image={`/static/images/cage/number/${number}.png`}
                        widthFrame={153}
                        isResponsive
                        heightFrame={153}
                        steps={8}
                        autoplay={true}
                        loop={false}
                        fps={30}
                        startAt={isShowResultAnim ? 0 : 31}
                        endAt={31}
                    />
                </div>
            );
        } else {
            return <></>;
        }
    }, [isDelayShowResult, isShowResultAnim]);
};

export default ResultNumber;
