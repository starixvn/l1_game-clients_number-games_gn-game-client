import React, { useCallback, useEffect, useState } from "react";

import { animateValue } from "../../../_shared/helpers/number-increasement";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import Ball, { BallStatus, IBall } from "../ball";
import Style from "./round-base-result-container.module.scss";

export type IResultSlotContainer = {
    className?: string;
    defaultRoundData: IBall[];
    roundResult?: number[];
} & Partial<GameStateContextModel>;

export const RoundBaseResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { className, roundState, defaultRoundData, roundResult, playResultAnimation } = props;

    const [ballsData, setBallsData] = useState<IBall[]>([]);
    const [totalPoint, setTotalPoint] = useState<number>(0);

    const incrementTotalPoint = useCallback((point: number) => {
        const timeOut = setTimeout(() => {
            setTotalPoint((currentTotalPoint) => {
                const obj = document.getElementById("totalPoint");
                const newTotal = currentTotalPoint + point;
                if (obj) {
                    animateValue(obj, currentTotalPoint, newTotal, 1000);
                }
                return newTotal;
            });
        }, 200);

        return () => {
            clearTimeout(timeOut);
        };
    }, []);

    useEffect(() => {
        if (roundResult && roundState === RoundState.DisplayResult && !playResultAnimation) {
            let totalTmp = 0;
            roundResult.forEach((number) => {
                totalTmp += number;
            });
            const obj = document.getElementById("totalPoint");
            if (obj) {
                animateValue(obj, 0, totalTmp, 1000);
            }
        }
    }, [roundState, playResultAnimation, roundResult]);

    useEffect(() => {
        const cloneDefaultData = () => {
            return defaultRoundData.map((data) => {
                return { ...data };
            });
        };

        const getBallsDataFromRoundData = () => {
            const clonedData = cloneDefaultData();
            if (roundResult && roundResult?.length > 0) {
                for (let i = 0; i < clonedData.length; i++) {
                    const number = roundResult[i];
                    if (number) {
                        clonedData[i].number = number;
                        clonedData[i].status = BallStatus.SHOW;
                        clonedData[i].delayTime = playResultAnimation ? i * 1000 + 1300 : 0;
                        clonedData[i].incrementTotalPoint = incrementTotalPoint;
                    }
                }
            }
            return clonedData;
        };

        const data = getBallsDataFromRoundData();

        setBallsData(data);
    }, [roundResult]);

    if (roundState !== RoundState.DisplayResult) {
        return (
            <div className={Style["result-area"]}>
                <div className={`${Style["container"]} ${className}`}>
                    {defaultRoundData.map((result, index) => {
                        return <Ball key={index} index={index} {...result} isRoundBase={true} roundState={roundState} />;
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className={Style["result-area"]}>
            <div className={`${Style["container"]} ${className}`}>
                {ballsData.map((result, index) => {
                    return <Ball key={index} index={index} {...result} isRoundBase={true} roundState={roundState} />;
                })}
            </div>
            {roundState === RoundState.DisplayResult && <h1 className={Style["total"]} id="totalPoint"></h1>}
        </div>
    );
};
