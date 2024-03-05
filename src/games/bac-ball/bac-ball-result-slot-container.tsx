import React, { useEffect, useState } from "react";

import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../components/game-base/type";
import Ball, { BallStatus, IBall } from "../../components/game-components/ball";
import Style from "./bac-ball.module.scss";

export interface IResultSlotContainer {
    delayTime: number;
    betChoice: string;
}

export const BacBallResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { delayTime, betChoice } = props;
    const betChoiceBalls = `${betChoice}Balls`;
    const defaultRoundData = [
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
    ];

    const [ballsData, setBallsData] = useState<IBall[]>([]);
    const gameStateContext = useGameStateContext();
    const { result, roundState, roundData, turnCounter, drawId } = gameStateContext;

    const updateLoadingIcon = (data) => {
        const currentRound = data?.find((ball) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
            setBallsData(data);
        }
    };

    useEffect(() => {
        if (roundData?.[betChoiceBalls]?.length > 0) {
            let clonedData = defaultRoundData.map((data) => {
                return { ...data };
            });
            for (let i = 0; i < clonedData.length; i++) {
                const value = roundData[betChoiceBalls][i];
                if (value) {
                    clonedData[i].number = value;
                    clonedData[i].status = BallStatus.SHOW;
                    clonedData[i].delayTime = 0;
                }
            }
            setBallsData(clonedData);
        }
    }, [roundData]);

    useEffect(() => {
        if (result && drawId === result.drawId && ballsData.length > 0) {
            let clonedData = [...ballsData];
            if (clonedData[turnCounter - 1]) {
                clonedData[turnCounter - 1].status = BallStatus.LOADING;
                clonedData[turnCounter - 1].number = result[betChoice];
                clonedData[turnCounter - 1].delayTime = delayTime;
                setBallsData(clonedData);
            }
        }
    }, [result]);

    useEffect(() => {
        if (turnCounter === 1) {
            setBallsData(defaultRoundData);
        }
    }, [turnCounter]);

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            updateLoadingIcon([...ballsData]);
        }
    }, [roundState]);

    return (
        <div className={Style["ball-container"]}>
            {ballsData.map((result, index) => {
                return <Ball key={index} {...result} />;
            })}
        </div>
    );
};
