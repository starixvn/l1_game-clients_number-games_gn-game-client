import { FC, useState } from "react";
import { BetLogProps } from "../../../components/game-components/bet-history";
import TableRow from "./row-table";
import Styles from "./common.module.scss";
import { seperateDateTime, preprocessBetLogTime } from "./helper";

export interface BetHistory {
    time: Date;
    betwin: number;
    totalAmount: number;
    drawId: number;
    result: {
        player: number;
        banker: number;
    };
    betLogDetails: any[];
    odds: {
        player: number;
        banker: number;
        tie: number;
    };
    settlementResult: {
        player: boolean;
        banker: boolean;
        tie: boolean;
    };
}

const renderBetLog = ({ betLogs, handleScroll, onCloseModal, renderBetDetail }: BetLogProps) => {
    return <BetLog betLogs={betLogs} handleScroll={handleScroll} onCloseModal={onCloseModal} renderBetDetail={renderBetDetail} />;
};

const BetLog: FC<BetLogProps> = ({ betLogs, handleScroll, onCloseModal: toggleBetHistory, renderBetDetail }) => {
    const [betLogDetail, setBetLogDetail] = useState<BetHistory>(undefined);
    const handleClickDrawId = (betLogDetail: BetHistory) => {
        toggleBetHistory();
        setBetLogDetail(betLogDetail);
    };

    const renderbody = () => {
        const preprocessedBetLogs = preprocessBetLogTime(betLogs);
        return preprocessedBetLogs?.map((item) => {
            return <BetHistoryRow betHistory={item} key={item.drawId} handleClickDrawId={handleClickDrawId} />;
        });
    };

    const handleCloseBetDetail = () => {
        setBetLogDetail(undefined);
        toggleBetHistory();
    };

    const header = [
        { node: "Time", size: 3 },
        { node: "DrawID", size: 2 },
        {
            node: (
                <>
                    Result
                    <br />
                    Player | Banker
                </>
            ),
            size: 3,
        },
        { node: "Total Stake", size: 2 },
        { node: "Win", size: 2 },
    ];

    return (
        <div className={Styles["table-fixed-head"]}>
            <table>
                <thead>
                    <TableRow isHeader={true}>{header}</TableRow>
                </thead>
                <tbody onScroll={handleScroll}>{renderbody()}</tbody>
            </table>
            {renderBetDetail({
                betLogDetails: betLogDetail?.betLogDetails,
                onCloseModal: handleCloseBetDetail,
                isShowBetDetail: !!betLogDetail,
                drawInfo: {
                    drawId: betLogDetail?.drawId,
                    result: betLogDetail?.result,
                    odds: betLogDetail?.odds,
                    stake: getStake(betLogDetail, betLogDetail?.settlementResult),
                },
            })}
        </div>
    );
};

const getStake = (betHistory: BetHistory, settlementResult: any) => {
    return Object.keys(settlementResult ?? {}).reduce((acc, key) => {
        if (settlementResult[key]) {
            return { ...acc, [key]: betHistory[key] ?? 0 };
        }
    }, {});
};

const BetHistoryRow: FC<{ betHistory: BetHistory; handleClickDrawId: Function }> = ({ betHistory, handleClickDrawId }) => {
    const { date, time } = seperateDateTime(betHistory.time);

    const content = [
        {
            node: (
                <>
                    <b>{time}</b> <br /> <div>{date}</div>
                </>
            ),
            size: 3,
        },
        {
            node: (
                <button className={Styles["btn-clickable"]} onClick={() => handleClickDrawId(betHistory)}>
                    {betHistory.drawId}
                </button>
            ),
            size: 2,
        },
        {
            node: (
                <div className={Styles["result-container"]}>
                    <div>{betHistory.result.player}</div>
                    <div>{betHistory.result.banker}</div>
                </div>
            ),
            size: 4,
        },
        { node: betHistory.totalAmount, size: 2 },
        { node: <div className={betHistory.betwin > 0 ? Styles["highlight"] : ""}>{betHistory.betwin}</div>, size: 2 },
    ];

    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLog;
