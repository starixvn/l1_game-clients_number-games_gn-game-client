import { FC } from "react";
import { useBallColor } from "../../../_shared/helpers";
import Styles from "./history.module.scss";
import { BetLogProps } from "../../../components/game-components/bet-history";
import BetHistoryBase from "../../../components/game-components/bet-history/bet-history-base";

const BetLogResultCell: FC<{ result: { ball: number } }> = ({ result: { ball } }) => {
    const ballColor = useBallColor;
    return (
        <div className={Styles["result-container"]}>
            <div className={`${Styles["ball"]} ${Styles[ballColor({ number: ball })]}`}>{ball}</div>
        </div>
    );
};

const renderBetLog = ({ betLogs, handleScroll, isLoadMore }: BetLogProps) => {
    return (
        <BetHistoryBase
            betLogs={betLogs}
            handleScroll={handleScroll}
            isLoadMore={isLoadMore}
            renderBetLogResult={(result) => <BetLogResultCell result={result} />}
        />
    );
};

export default renderBetLog;
