import React, { useEffect, useState } from "react";

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

    const updateLoadingIcon = (data) => {
        const currentRound = data?.find((ball) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
        }
    };

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            updateLoadingIcon([...ballsData]);
        }
    }, [roundState]);

    useEffect(() => {
        const cloneDefaultData = () => {
            return defaultRoundData.map((data) => {
                return { ...data };
            });
        };

        const getBallsDataFromRoundData = () => {
            let clonedData = cloneDefaultData();
            if (roundResult && roundResult?.length > 0) {
                for (let i = 0; i < clonedData.length; i++) {
                    const number = roundResult[i];
                    if (number) {
                        clonedData[i].number = number;
                        clonedData[i].status = BallStatus.SHOW;
                        clonedData[i].delayTime = playResultAnimation ? i * 1000 + 500 : 0;
                    }
                }
            }
            return clonedData;
        };

        const data = getBallsDataFromRoundData();
        updateLoadingIcon(data);
        setBallsData(data);
    }, [roundResult]);

    useEffect(() => {
        // if (roundResult && roundResult.length > 0) {
        //     roundResult.forEach((result, i) => {
        //         setTimeout(() => {
        //             setTotalPoint(totalPoint +);
        //         }, i * 1000);
        //     });
        // }
    }, [totalPoint]);

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
            <h1 className={Style["total"]}>23</h1>
        </div>
    );
};
