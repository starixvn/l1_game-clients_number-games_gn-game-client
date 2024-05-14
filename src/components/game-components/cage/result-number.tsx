import React, { useMemo } from "react";

import { buildVersion } from "../../../_shared/constants";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultNumber: React.FC<{
    isDelayShowResult: boolean;
    isShowResultAnim: boolean;
    number: string;
    fps?: number;
    className?: string;
}> = ({ isDelayShowResult, number, isShowResultAnim, fps, className }) => {
    const currentTime = Date.now();

    return useMemo(() => {
        if (isDelayShowResult) {
            return (
                <div key={currentTime} id="result-text" className={`${Styles["number"]} ${className}`}>
                    <Spritesheet
                        image={`/static/images/cage/number/${number}.webp?v=${buildVersion}`}
                        widthFrame={153}
                        isResponsive
                        heightFrame={153}
                        steps={8}
                        autoplay={true}
                        loop={false}
                        fps={fps ?? 30}
                        startAt={isShowResultAnim ? 0 : 31}
                        endAt={31}
                    />
                </div>
            );
        } else {
            return <></>;
        }
    }, [isDelayShowResult, isShowResultAnim, number]);
};

export default ResultNumber;
