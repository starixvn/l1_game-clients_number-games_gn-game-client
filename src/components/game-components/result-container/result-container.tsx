import React, { useEffect, useState } from "react";
import Style from "./result-container.module.scss";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import Ball, { BallStatus, IBall } from "../ball";
import { RoundState } from "../../game-base/type";

export type IResultSlotContainer = {
    delayTime: number;
    betChoice: string;
    className?: string;
    defaultRoundData: IBall[];
} & Partial<GameStateContextModel>;

export const ResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { defaultRoundData, delayTime, betChoice, className, result, roundState, roundData, turnCounter, drawId } = props;

    const betChoiceBalls = `${betChoice}Balls`;

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

    useEffect(() => {
        let clonedData = cloneDefaultData();
        if (roundData?.[betChoiceBalls]?.length > 0) {
            for (let i = 0; i < clonedData.length; i++) {
                const result = roundData[betChoiceBalls][i];
                if (result) {
                    clonedData[i].number = result;
                    clonedData[i].status = BallStatus.SHOW;
                    clonedData[i].delayTime = 0;
                }
            }
        }
        updateLoadingIcon(clonedData);
        setBallsData(clonedData);
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
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            if (turnCounter === 1) {
                const defaultData = cloneDefaultData();
                updateLoadingIcon(defaultData);
                setBallsData(defaultData);
            } else {
                updateLoadingIcon([...ballsData]);
            }
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
