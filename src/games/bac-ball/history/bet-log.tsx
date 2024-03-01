import { FC, useState } from "react";
import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { BetLogProps } from "../../../components/game-components/bet-history";
import Styles from "./common.module.scss";
import { preprocessBetLogTime, seperateDateTime } from "./helper";
import TableRow from "./row-table";

export interface BetHistory {
    time: Date;
    betwin: number;
    totalAmount: number;
    drawId: number;
    player: number;
    banker: number;
    tie: number;
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
        <div className="table-container react-infinite-table">
            <table className="table text-center">
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
                    settlementResult: betLogDetail?.settlementResult,
                },
            })}
        </div>
    );
};

const BetHistoryRow: FC<{ betHistory: BetHistory; handleClickDrawId: Function }> = ({ betHistory, handleClickDrawId }) => {
    const { drawId, result, totalAmount, betwin } = betHistory;
    const ballColor = useBallColor;
    const { date, time } = seperateDateTime(betHistory.time);

    const { player, banker } = result;

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
                <button className="clickable" onClick={() => handleClickDrawId(betHistory)}>
                    {drawId}
                </button>
            ),
            size: 2,
        },
        {
            node: (
                <div className={Styles["result-container"]}>
                    <div className={`${Styles["ball"]} ${Styles[ballColor({ number: player })]}`}>{player}</div>
                    <div className={`${Styles["ball"]} ${Styles[ballColor({ number: banker })]}`}>{banker}</div>
                </div>
            ),
            size: 4,
        },
        { node: totalAmount, size: 2 },
        { node: <div className={betwin > 0 ? "highlight" : ""}>{betwin}</div>, size: 2 },
    ];

    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLog;
