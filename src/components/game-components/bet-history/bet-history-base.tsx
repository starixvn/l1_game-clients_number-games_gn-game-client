import { FC, ReactNode } from "react";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../_shared/helpers";
import { InfiniteTable } from "../infinite-table";
import Styles from "./bet-history.module.scss";

export interface BetLog {
    drawId: number;
    result: any;
    odds: number;
    settlementResult: any;
    pfResult: any;
    clientSeed: string;
}

export interface BetHistoryProps {
    betLogs: any[];
    handleScroll: (event: any) => void;
    isLoadMore: boolean;
    renderBetLogResult: (result: any) => ReactNode;
}

const BetHistoryBase: FC<BetHistoryProps> = ({ betLogs, handleScroll, isLoadMore, renderBetLogResult }) => {
    const dispatch = useGameStatesDispatch();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();

    const clickSound = useClickSound();

    const handleClickDrawId = (betLogDetail: BetLog) => {
        clickSound();
        dispatch({
            type: GameEventActionType.UPDATE_BET_DETAIL,
            payload: {
                betDetailModalData: {
                    ...betLogDetail,
                    drawInfo: {
                        drawId: betLogDetail?.drawId,
                        result: betLogDetail?.result,
                        odds: betLogDetail?.odds,
                        settlementResult: betLogDetail?.settlementResult,
                        pfResult: betLogDetail?.pfResult,
                        clientSeed: betLogDetail?.clientSeed,
                    },
                },
            },
        });
        dispatch({
            type: GameEventActionType.TOGGLE_BET_DETAIL,
            payload: {
                isShowBetDetail: true,
            },
        });
    };

    const header = [
        { node: translateCommon("time") },
        { node: translateSNGames("glossary_draw_id").capitalizeFirstLetter() },
        {
            node: <>{translateCommon("result")}</>,
        },
        { node: translateCommon("total_stake") },
        { node: translateCommon("win") },
    ];

    const betLogsWithSettleTime = betLogs.map((item) => {
        return { ...item, time: item?.result?.time };
    });

    const preprocessedBetLogs = sortedCollectionByTime(betLogsWithSettleTime);
    const body = preprocessedBetLogs?.map((item) => {
        const { drawId, result, totalAmount, betwin } = item;
        const { date, time } = separateDateTime(item.time);

        const content = [
            {
                node: (
                    <>
                        {time} <br />
                        {date}
                    </>
                ),
            },
            {
                node: (
                    <button className="clickable" onClick={() => handleClickDrawId(item)}>
                        {drawId}
                    </button>
                ),
            },
            {
                node: renderBetLogResult(result),
            },
            { node: numberWithCommas(totalAmount) },
            { node: <div className={betwin > 0 ? "highlight" : ""}>{numberWithCommas(betwin)}</div> },
        ];

        return content;
    });
    return (
        <InfiniteTable
            header={header}
            body={body}
            customTableContainerStyles={Styles["history"]}
            addData={handleScroll}
            isAddData={isLoadMore}
            noData={betLogs.length <= 0}
        />
    );
};

export default BetHistoryBase;
