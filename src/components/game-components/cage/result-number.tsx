import React, { useMemo } from "react";

import { RoundState } from "../../game-base/type";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultNumber: React.FC<{
    isDelayShowResult: boolean;
    roundState: RoundState;
    ballSpeed: number;
    isShowResultAnim: boolean;
    number: string;
}> = ({ isDelayShowResult, roundState, ballSpeed, number, isShowResultAnim }) => {
    const currentTime = Date.now();
    console.log(`/static/images/cage/new-number/${number}.png`);
    return useMemo(() => {
        if (isDelayShowResult && roundState === RoundState.DisplayResult) {
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
    }, [isDelayShowResult, roundState]);
};

export default ResultNumber;
