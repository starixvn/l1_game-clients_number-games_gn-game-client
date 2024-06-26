import { FC, useEffect, useState } from "react";

import { getGlossaryTranslate } from "../../_shared/helpers";
import { useGameContext } from "../../_shared/react-contexts";
import { useTranslator } from "../../_shared/react-hooks";
import { RoundState } from "../../components/game-base/type";
import { SicBallBetOptions } from "./sic-ball-constants";
import Style from "./sic-ball.module.scss";

const SicBallResultTotalPoint: FC<{ roundState: RoundState; playResultAnimation: boolean; results: any }> = ({
    roundState,
    playResultAnimation,
    results,
}) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    const totalPoint = results ? results.reduce((prevTotal, current) => prevTotal + current) : 0;
    const choice = totalPoint >= 11 ? SicBallBetOptions.BIG : SicBallBetOptions.SMALL;
    const result = `${totalPoint} - ${t(getGlossaryTranslate(tolgeeNamespace, choice)) || choice}`;

    const [showTotal, setShowTotal] = useState(false);

    const showAllBallsDelayTime = 2500;

    useEffect(() => {
        if (roundState === RoundState.DisplayResult) {
            const timeout = setTimeout(
                () => {
                    setShowTotal(true);
                },
                playResultAnimation ? showAllBallsDelayTime : 0
            );

            return () => {
                clearTimeout(timeout);
            };
        }
    }, [roundState]);

    if (!showTotal) {
        return <></>;
    }

    return (
        <div className={`${Style["total-point-container"]} ${playResultAnimation ? Style["has-anim"] : ""}`}>
            <div className={`${Style["total-point-bg-blur"]}`}></div>
            <span className={Style["total-point"]}>{result}</span>
        </div>
    );
};

export default SicBallResultTotalPoint;
