import React, { useEffect, useState } from "react";

import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import Ball from "../../components/game-components/ball";
import Style from "./bac-ball.module.scss";

export interface IResultSlotContainer {
    delayTime: number;
    betChoice: string;
}

export const BacBallResultSlotContainer: React.FC<IResultSlotContainer> = (props) => {
    const { delayTime, betChoice } = props;
    const betChoiceBalls = `${betChoice}Balls`;
    const defaultData = [0, 0, 0, 0];
    const [ballsData, setBallsData] = useState<number[]>(defaultData);
    const gameStateContext = useGameStateContext();
    const { result, roundData, turnCounter, drawId } = gameStateContext;

    useEffect(() => {
        if (!roundData || !roundData[betChoiceBalls] || roundData[betChoiceBalls].length === 0) {
            return;
        }

        const updatedPlayerList = [...ballsData];
        for (let i = 0; i < ballsData.length; i++) {
            const value = roundData[betChoiceBalls][i];
            if (value) {
                updatedPlayerList[i] = value;
            }
        }
        setBallsData(updatedPlayerList);
    }, [roundData]);

    useEffect(() => {
        if (!result || drawId !== result.drawId) {
            return;
        }

        const dataList = [...ballsData];
        dataList[turnCounter - 1] = result[betChoice];
        setBallsData(dataList);
    }, [result]);

    useEffect(() => {
        turnCounter === 1 && setBallsData(defaultData);
    }, [turnCounter]);

    return (
        <div className={Style["ball-container"]}>
            {ballsData.map((result, index) => {
                const props: any = {};

                if (result > 0 && turnCounter !== index + 1) {
                    props.number = result;
                    props.delayTime = 0;
                    props.joinGame = gameStateContext.signedIn;
                } else if (result > 0) {
                    props.number = result;
                    props.isLoading = true;
                    props.delayTime = delayTime;
                }

                return <Ball key={index} {...props} />;
            })}
        </div>
    );
};
