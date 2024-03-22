import { FC, useState } from "react";

import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { useClickSound } from "../../../_shared/react-hooks";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { PFResult } from "../../../components/game-base/type";
import { BetLogProps } from "../../../components/game-components/bet-history";
import Styles from "./common.module.scss";
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
    pfResult: PFResult;
    clientSeed: string;
}

const renderBetLog = ({ betLogs, handleScroll, onCloseModal, renderBetDetail, isLoadMore }: BetLogProps) => {
    return (
        <BetLog
            betLogs={betLogs}
            handleScroll={handleScroll}
            onCloseModal={onCloseModal}
            renderBetDetail={renderBetDetail}
            isLoadMore={isLoadMore}
        />
    );
};

const BetLog: FC<BetLogProps> = ({ betLogs, handleScroll, onCloseModal: toggleBetHistory, renderBetDetail, isLoadMore }) => {
    const [betLogDetail, setBetLogDetail] = useState<BetHistory>(undefined);
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();

    const clickSound = useClickSound();

    const handleClickDrawId = (betLogDetail: BetHistory) => {
        clickSound();
        toggleBetHistory();
        setBetLogDetail(betLogDetail);
    };

    const renderbody = () => {
        const betLogsWithSettleTime = betLogs.map((item) => {
            return { ...item, time: item?.result?.time };
        });
        const preprocessedBetLogs = sortedCollectionByTime(betLogsWithSettleTime);
        return preprocessedBetLogs?.map((item) => {
            return <BetHistoryRow betHistory={item} key={item.drawId} handleClickDrawId={handleClickDrawId} />;
        });
    };

    const handleCloseBetDetail = () => {
        setBetLogDetail(undefined);
        toggleBetHistory();
    };

    const header = [
        { node: translateCommon("time"), size: 3 },
        { node: translateSNGames("glossary_draw_id").capitalizeFirstLetter(), size: 2 },
        {
            node: <>{translateCommon("result")}</>,
            size: 3,
        },
        { node: translateCommon("total_stake"), size: 2 },
        { node: translateCommon("win"), size: 2 },
    ];
    return (
        <div className={`table-container react-infinite-table ${Styles["history"]}`} onScroll={handleScroll}>
            <table className="table text-center">
                <thead>
                    <TableRow isHeader={true}>{header}</TableRow>
                </thead>
                <tbody>{renderbody()}</tbody>
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
                    pfResult: betLogDetail?.pfResult,
                    clientSeed: betLogDetail?.clientSeed,
                },
            })}
            {betLogs.length === 0 && <div className={Styles["no-more-data"]}>{translateSNGames("table_no_data")}</div>}
            {!isLoadMore && betLogs.length > 0 && <div className={Styles["no-more-data"]}>{translateSNGames("table_no_more_data")}</div>}
        </div>
    );
};

const BetHistoryRow: FC<{ betHistory: BetHistory; handleClickDrawId: Function }> = ({ betHistory, handleClickDrawId }) => {
    const { drawId, result, totalAmount, betwin } = betHistory;
    const ballColor = useBallColor;
    const { date, time } = separateDateTime(betHistory.time);

    const { player, banker } = result;

    const content = [
        {
            node: (
                <>
                    {time} <br />
                    {date}
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
        { node: numberWithCommas(totalAmount), size: 2 },
        { node: <div className={betwin > 0 ? "highlight" : ""}>{numberWithCommas(betwin)}</div>, size: 2 },
    ];

    return <TableRow isHeader={false}>{content}</TableRow>;
};

export default renderBetLog;
