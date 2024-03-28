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
    betChoiceBalls: string;
} & Partial<GameStateContextModel>;

export const ResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { delayTime, betChoice, className, roundState, roundData, turnCounter, defaultRoundData, betChoiceBalls } = props;

    const [ballsData, setBallsData] = useState<IBall[]>([]);

    const updateLoadingIcon = (data) => {
        const currentRound = data?.find((ball) => ball.number === 0);
        if (currentRound) {
            currentRound.status = BallStatus.LOADING;
        }
    };

    useEffect(() => {
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
                        if (i === turnCounter - 1) {
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
