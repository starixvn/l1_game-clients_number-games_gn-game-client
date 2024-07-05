import React, { ReactNode } from "react";

import { Round } from "../../../game-base/type";
import { SideBetScoreboardProps } from "../../statistic/types";
import Styles from "./side-bet-scoreboard.module.scss";

const COLUMN_NUMBER_MIN = 11;

const drawHistory = (roundHistory: Round<any, any>[], getDotDetails: (round: Round<any, any>) => ReactNode) => {
    if (roundHistory.length > COLUMN_NUMBER_MIN) {
        return drawDataFullBoard(roundHistory, getDotDetails);
    } else {
        return drawDataNotFullBoard(roundHistory, getDotDetails);
    }
};

const drawDataFullBoard = (roundHistory: Round<any, any>[], getDotDetails: (round: Round<any, any>) => ReactNode) => {
    return roundHistory.map((round) => {
        return getDotDetails(round.result);
    });
};

const drawDataNotFullBoard = (roundHistory: Round<any, any>[], getDotDetails: (round: Round<any, any>) => ReactNode) => {
    const initialData = [];
    for (let i = 0; i < COLUMN_NUMBER_MIN; i++) {
        initialData[i] = roundHistory[i] ?? null;
    }

    return initialData.map((round) => {
        return getDotDetails(round?.result ?? null);
    });
};

export const SideBetScoreboardContainer: React.FC<SideBetScoreboardProps> = (props) => {
    const { roundHistory, getDotDetails } = props;

    return (
        <div className={Styles["score-board-container"]}>
            {drawHistory([...roundHistory].reverse(), (round: Round<any, any>) => getDotDetails(round))}
        </div>
    );
};

export default SideBetScoreboardContainer;
