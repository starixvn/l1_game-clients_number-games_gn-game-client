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
    const { delayTime, betChoice, className, result, roundState, roundData, turnCounter, drawId } = props;

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

    const updateResult = () => {
        if (result && drawId === result.drawId && ballsData.length > 0) {
            let clonedData = [...ballsData];
            if (clonedData[turnCounter - 1]) {
                clonedData[turnCounter - 1].status = BallStatus.LOADING;
                clonedData[turnCounter - 1].number = result[betChoice];
                clonedData[turnCounter - 1].delayTime = delayTime;
                setBallsData(clonedData);
            }
        }
    };

    const resetBalls = () => {
        const defaultData = cloneDefaultData();
        updateLoadingIcon(defaultData);
        setBallsData(defaultData);
    };

    useEffect(() => {
        let clonedData = cloneDefaultData();
        if (roundData?.[betChoiceBalls]?.length > 0) {
            for (let i = 0; i < clonedData.length; i++) {
                const number = roundData[betChoiceBalls][i];
                if (number) {
                    clonedData[i].number = number;
                    clonedData[i].status = BallStatus.SHOW;
                    clonedData[i].delayTime = 0;
                }
            }
        }
        updateLoadingIcon(clonedData);
        updateResult();
        setBallsData(clonedData);
    }, [roundData]);

    useEffect(() => {
        updateResult();
    }, [result]);

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            if (turnCounter === 1) {
                resetBalls();
            } else {
                updateLoadingIcon([...ballsData]);
            }
        }

        if (roundState === RoundState.SwitchRound) {
            resetBalls();
        }
    }, [roundState, turnCounter]);

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
