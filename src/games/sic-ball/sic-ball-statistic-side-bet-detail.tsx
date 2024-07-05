import React from "react";
import { v4 as uuidv4 } from "uuid";

import IconColumn from "../../components/game-components/round-history/icon-column";
import Styles from "../../components/game-components/round-history/icon-column/board-column.module.scss";
import { SicBallResult } from "./types";

const SicBallStatisticSideBetDetail = (result: SicBallResult) => {
    if (result === null) {
        return (
            <IconColumn key={uuidv4()}>
                <div className={Styles["board-item"]}></div>
                <div className={Styles["board-item"]}></div>
                <div className={Styles["board-item"]}></div>
            </IconColumn>
        );
    }

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
