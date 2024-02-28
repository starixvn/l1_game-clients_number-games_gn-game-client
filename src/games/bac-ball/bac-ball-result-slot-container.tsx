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
    const defaultData = [
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
        { number: 0, status: BallStatus.NONE, delayTime: 0 },
    ];
    const [ballsData, setBallsData] = useState<IBall[]>(defaultData);
    const gameStateContext = useGameStateContext();
    const { result, roundState, roundData, turnCounter, drawId } = gameStateContext;

    useEffect(() => {
        if (!roundData || !roundData[betChoiceBalls] || roundData[betChoiceBalls].length === 0) {
            return;
        }

        const clonedData = [...ballsData];
        for (let i = 0; i < ballsData.length; i++) {
            const value = roundData[betChoiceBalls][i];
            if (value) {
                clonedData[i].number = value;
                clonedData[i].status = BallStatus.SHOW;
                clonedData[i].delayTime = 0;
            }
        }
        setBallsData(clonedData);
    }, [roundData]);

    useEffect(() => {
        if (!result || drawId !== result.drawId) {
            return;
        }

        const clonedData = [...ballsData];
        clonedData[turnCounter - 1].number = result[betChoice];
        clonedData[turnCounter - 1].delayTime = delayTime;
        setBallsData(clonedData);
    }, [result]);

    useEffect(() => {
        turnCounter === 1 && setBallsData(defaultData);
    }, [turnCounter]);

    useEffect(() => {
        if (roundState === RoundState.LockingBet || roundState === RoundState.InRound) {
            const clonedData = [...ballsData];
            const currentRound = clonedData.find((ball) => ball.number === 0);
            currentRound && (currentRound.status = BallStatus.LOADING);
            setBallsData(clonedData);
        }
    }, [roundState]);

    return (
        <div className={Style["ball-container"]}>
            {ballsData.map((result, index) => {
                const props: any = {};
                props.number = result.number;
                props.delayTime = result.delayTime;
                if (result.number > 0 || result.status === BallStatus.LOADING) {
                    props.status = result.status;
                } else {
                    props.status = BallStatus.NONE;
                }

                return <Ball key={index} {...props} />;
            })}
        </div>
    );
};
