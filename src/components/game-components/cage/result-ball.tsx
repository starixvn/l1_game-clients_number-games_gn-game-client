import React, { useMemo } from "react";

import { buildVersion } from "../../../_shared/constants";
import { useMemoriedImage, useShowBallResultSound } from "../../../_shared/react-hooks";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";
import { CachedImage } from "../cached-image";

const ResultBall: React.FC<{
    isDelayShowResult: boolean;
    ballColor: string;
    isShowResultAnim: boolean;
    fps?: number;
}> = ({ isDelayShowResult, ballColor, isShowResultAnim, fps }) => {
    const currentTime = Date.now();
    const playShowBallResult = useShowBallResultSound();
    const { data } = useMemoriedImage(`/static/images/cage/${ballColor}.webp`);

    return useMemo(() => {
        if (!isDelayShowResult || !data) {
            return null;
        }
        const ballImage = ballColor.includes("blue") ? "blue" : "red";
        isShowResultAnim && playShowBallResult();
        return (
            <div key={currentTime} id="show-ball-anim" className={Styles["show-ball-anim"]}>
                <CachedImage
                    width={120}
                    height={120}
                    className={Styles["ball-blur"]}
                    src={`/static/images/cage/ball-blur.webp`}
                    alt="img-blur"
                />

                {isShowResultAnim ? (
                    <Spritesheet
                        className={"sss"}
                        image={`/static/images/cage/${ballColor}.webp?v=${buildVersion}`}
                        imageData={data}
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
                    <CachedImage
                        className={"sss"}
                        src={`/static/images/cage/${ballImage}.webp`}
                        alt="img-result"
                        width={153}
                        height={153}
                    />
                )}
            </div>
        );
    }, [isDelayShowResult, ballColor, isShowResultAnim, data]);
};

export default ResultBall;
