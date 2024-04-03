import React, { useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../components/game-base/type";
import Ball, { BallStatus, IBall } from "../../components/game-components/ball";
import Style from "./bac-ball.module.scss";

export type IResultSlotContainer = {
    delayTime: number;
    betChoice: string;
    className?: string;
} & Partial<GameStateContextModel>;

export const BacBallResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { delayTime, betChoice, className, roundState, roundData, turnCounter, playResultAnimation } = props;

    const betChoiceBalls = `${betChoice}Balls`;
    const defaultRoundData = [
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
    ];

    const [ballsData, setBallsData] = useState<IBall[]>([]);

    const updateLoadingIcon = (data) => {
        const currentRound = data?.find((ball) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
        }
    };

    const cloneDefaultData = () => {
        return defaultRoundData.map((data) => {
            return { ...data };
        });
    };

    const getBallsDataFromRoundData = () => {
        let clonedData = cloneDefaultData();
        if (roundData?.[betChoiceBalls]?.length > 0) {
            for (let i = 0; i < clonedData.length; i++) {
                const number = roundData[betChoiceBalls][i];
                if (number) {
                    clonedData[i].number = number;
                    if (playResultAnimation && i === turnCounter - 1) {
                        clonedData[i].status = BallStatus.LOADING;
                        clonedData[i].delayTime = delayTime;
                    } else {
                        clonedData[i].status = BallStatus.SHOW;
                        clonedData[i].delayTime = 0;
                    }
                }
            }
        }
        return clonedData;
    };

    useEffect(() => {
        const data = getBallsDataFromRoundData();
        updateLoadingIcon(data);
        setBallsData(data);
    }, [roundData]);

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            updateLoadingIcon([...ballsData]);
        }
    }, [roundState]);

    if (betChoice === null) {
        return (
            <div className={`${Style["ball-container"]} ${className}`}>
                {defaultRoundData.map((result, index) => {
                    return <Ball key={index} index={index} {...result} />;
                })}
            </div>
        );
    }

    return (
        <div className={`${Style["ball-container"]} ${className}`}>
            {ballsData.map((result, index) => {
                return <Ball key={index} index={index} {...result} />;
            })}
        </div>
    );
};
