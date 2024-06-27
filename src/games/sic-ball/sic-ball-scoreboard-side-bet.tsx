import React from "react";
import { v4 as uuidv4 } from "uuid";
import Styles from "../../components/game-components/statistic/statistic.module.scss";
import { SideBetScoreboardProps } from "../../components/game-components/statistic/types";

const SicBallSideBetIcon = ({ value }) => {
    return (
        <div className={Styles["scoreboard-side-bet-icon"]}>
            {value.map((number) => (
                <span key={uuidv4()} className={`icon-specific${number}`}>
                    <span className="path1"></span>
                    <span className="path2"></span>
                    <span className="path3"></span>
                </span>
            ))}
        </div>
    );
};

const SicBallSideBetColumn = (result: any) => {
    const itemValues = Object.values(result);

    return (
        <div className={Styles["scoreboard-side-bet"]}>
            {itemValues.map((value) => (
                <SicBallSideBetIcon key={uuidv4()} value={value} />
            ))}
        </div>
    );
};

export const SicBallScoreboardSideBet: React.FC<SideBetScoreboardProps> = ({ roundHistory }) => {
    const result = [...roundHistory].reverse().map((round) => round.result.balls);

    return SicBallSideBetColumn(result);
};

export default SicBallScoreboardSideBet;
