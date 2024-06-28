import React, { ReactNode } from "react";
import Styles from "./side-bet-scoreboard.module.scss";
import { SideBetScoreboardProps } from "../../statistic/types";
import { Round } from "../../../game-base/type";

const drawHistory = (roundHistory: Round<any, any>[], getDotDetails: (round: Round<any, any>) => ReactNode) => {
    return roundHistory.map((round) => {
        return getDotDetails(round.result);
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
