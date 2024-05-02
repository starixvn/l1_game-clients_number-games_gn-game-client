import Image from "next/image";
import React, { useMemo } from "react";

import { buildVersion } from "../../../_shared/constants";
import { useShowBallResultSound } from "../../../_shared/react-hooks";
import { buildVersion } from "../../../_shared/constants";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    ballColor: string;
    isShowResultAnim: boolean;
    fps?: number;
}> = ({ isDelayShowResult, ballColor, isShowResultAnim, fps }) => {
    const currentTime = Date.now();
    const playShowBallResult = useShowBallResultSound();

    return useMemo(() => {
        if (!isDelayShowResult) {
            return null;
        }
        const ballImage = ballColor.includes("blue") ? "blue" : "red";
        isShowResultAnim && playShowBallResult();
        return (
            <div key={currentTime} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                <Image
                    width={120}
                    height={120}
                    className={Styles["ball-blur"]}
                    src={`/static/images/cage/ball-blur.webp?v=${buildVersion}`}
                    alt="img-blur"
                />

                {isShowResultAnim ? (
                    <Spritesheet
                        className={"sss"}
                        image={`/static/images/cage/${ballColor}.webp?v=${buildVersion}`}
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
                    <img className={"sss"} src={`/static/images/cage/${ballImage}.webp?v=${buildVersion}`} alt="img-result" />
                )}
            </div>
        );
    }, [isDelayShowResult, ballColor, isShowResultAnim]);
};

export default ResultBall;
