import React from "react";
import { v4 as uuidv4 } from "uuid";

import IconColumn from "../../components/game-components/round-history/icon-column";
import Styles from "../../components/game-components/round-history/icon-column/board-column.module.scss";
import { SicBallResult } from "./types";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";

const SicBallStatisticSideBetDetail = (result: SicBallResult) => {
    const { roundHistory } = useGameStateContext();
    let itemValues = [0, 0, 0];

    if (!!result && !!result.balls) {
        itemValues = Object.values(result.balls);
    }

    const isLastRound = roundHistory[0]?.drawId === result?.drawId;

    return (
        <IconColumn key={uuidv4()} isLastColumn={isLastRound}>
            {itemValues.map((value: number) => {
                return (
                    <div className={Styles["board-item"]} key={uuidv4()}>
                        {value > 0 && (
                            <span key={uuidv4()} className={`icon-specific${value} ${Styles["board-icon"]}`}>
                                <span className="path1"></span>
                                <span className="path2"></span>
                                <span className="path3"></span>
                            </span>
                        )}
                    </div>
                );
            })}
        </IconColumn>
    );
};

export default SicBallStatisticSideBetDetail;
