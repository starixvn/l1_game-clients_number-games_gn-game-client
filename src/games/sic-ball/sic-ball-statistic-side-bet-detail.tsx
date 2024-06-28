import React from "react";
import { v4 as uuidv4 } from "uuid";
import IconColumn from "../../components/game-components/round-history/icon-column";
import { SicBallResult } from "./types";
import Styles from "../../components/game-components/round-history/icon-column/board-column.module.scss";

const SicBallStatisticSideBetDetail = (result: SicBallResult) => {
    const itemValues = Object.values(result.balls);

    return (
        <IconColumn key={uuidv4()}>
            {itemValues.map((value: number) => {
                return (
                    <div className={Styles["board-item"]} key={uuidv4()}>
                        <span key={uuidv4()} className={`icon-specific${value} ${Styles["board-icon"]}`}>
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                        </span>
                    </div>
                );
            })}
        </IconColumn>
    );
};

export default SicBallStatisticSideBetDetail;
