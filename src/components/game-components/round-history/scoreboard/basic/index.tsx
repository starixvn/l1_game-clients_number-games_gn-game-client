import React from "react";

import { Round } from "../../../../game-base/type";
import Styles from "../round-history.module.scss";
import { Props } from "./types";

const drawHistory: any = <R, S>(roundHistory: Round<R, S>[], getDotDetails: (round: R, roundId: number) => void) => {
    return roundHistory.map((round: Round<R, S>) => {
        return getDotDetails(round.result, round.roundId);
    });
};

const ScoreboardBasic = <R, S>(props: Props<R, S>) => {
    const { roundHistory, getDotDetails } = props;
    return <div className={Styles["score-board-container"]}>{drawHistory([...roundHistory].reverse(), getDotDetails)}</div>;
};

export default React.memo(ScoreboardBasic);
