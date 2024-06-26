import { FC, useEffect, useState } from "react";

import { getBallColor, getGlossaryTranslate } from "../../_shared/helpers";
import { useGameContext } from "../../_shared/react-contexts";
import { useTranslator } from "../../_shared/react-hooks";
import BallRotation from "../../components/game-components/cage-result-list/ball-rotation";
import { SicBallBetOptions } from "./sic-ball-constants";
import Style from "./sic-ball.module.scss";

const SicBallResultTotalPoint: FC<{ playResultAnimation: boolean; results: any }> = ({ playResultAnimation, results }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    const totalPoint = results ? results.reduce((prevTotal, current) => prevTotal + current) : 0;
    const choice = totalPoint >= 11 ? SicBallBetOptions.BIG : SicBallBetOptions.SMALL;
    const result = `${totalPoint} - ${t(getGlossaryTranslate(tolgeeNamespace, choice)) || choice}`;

    const [showTotal, setShowTotal] = useState(false);

    const showAllBallsDelayTime = 2500;

    useEffect(() => {
        const timeout = setTimeout(
            () => {
                setShowTotal(true);
            },
            playResultAnimation ? showAllBallsDelayTime : 0
        );

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className={Style["result"]}>
            <div className={Style["balls-container"]}>
                {results?.map((result, index) => {
                    return (
                        <BallRotation
                            key={index}
                            ballPos={1}
                            number={result}
                            playResultAnimation={playResultAnimation}
                            delayTime={index * 800}
                            color={getBallColor(result)}
                            incrementTotalPoint={() => {}}
                            customClassName={`${Style["ball-rotation"]} fade-in`}
                        />
                    );
                })}
            </div>

            {showTotal && (
                <div className={Style["total-point-container"]}>
                    <div className={`${Style["total-point-bg-blur"]}`}></div>
                    <span className={Style["total-point"]}>{result}</span>
                </div>
            )}
        </div>
    );
};

export default SicBallResultTotalPoint;
