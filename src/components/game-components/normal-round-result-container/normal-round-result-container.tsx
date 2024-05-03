import React, { useEffect, useState } from "react";

import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import Ball, { BallStatus, IBall } from "../ball";
import Style from "./normal-round-result-container.module.scss";

export type IResultSlotContainer = {
    className?: string;
    defaultRoundData: IBall[];
    roundResult?: number[];
} & Partial<GameStateContextModel>;

export const NormalRoundResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { className, roundState, roundData, turnCounter, defaultRoundData, playResultAnimation, roundResult } = props;

    const [ballsData, setBallsData] = useState<IBall[]>([]);

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
                        clonedData[i].delayTime = i * 1000 + 500;
                    }
                }
            }
            return clonedData;
        };

        const data = getBallsDataFromRoundData();
        updateLoadingIcon(data);
        setBallsData(data);
    }, [roundResult]);

    if (roundState !== RoundState.DisplayResult) {
        return (
            <div className={`${Style["ball-container"]} ${className}`}>
                {defaultRoundData.map((result, index) => {
                    return <Ball key={index} index={index} {...result} roundState={roundState} />;
                })}
            </div>
        );
    }

    return (
        <div className={`${Style["ball-container"]} ${className}`}>
            {ballsData.map((result, index) => {
                return <Ball key={index} index={index} {...result} isNormalRound={true} roundState={roundState} />;
            })}
        </div>
    );
};
