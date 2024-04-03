import React, { useMemo } from "react";

import { RoundState } from "../../game-base/type";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    roundState: RoundState;
    ballColor: string;
    isShowResultAnim: boolean;
}> = ({ isDelayShowResult, roundState, ballColor, isShowResultAnim }) => {
    const currentTime = Date.now();

    return useMemo(() => {
        if (isDelayShowResult && roundState === RoundState.DisplayResult) {
            return (
                <div key={currentTime} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                    <Spritesheet
                        className={"sss"}
                        image={`/static/images/cage/${ballColor}.png`}
                        widthFrame={153}
                        isResponsive
                        heightFrame={153}
                        steps={8}
                        autoplay={true}
                        loop={false}
                        fps={30}
                        startAt={isShowResultAnim ? 0 : 30}
                        endAt={31}
                    />
                </div>
            );
        } else {
            return <></>;
        }
    }, [isDelayShowResult, roundState, ballColor, isShowResultAnim]);
};

export default ResultBall;
