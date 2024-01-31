import React from "react";
import { TFunction } from "next-i18next";

import { numberWithCommas } from "../../../../../../_shared/helpers/number-helper";
import { formatDate } from "../../../../../../_shared/helpers/time-helper";
import { BetLogs } from "../bet-history";
import { FormatNumber } from "../index";
import Styles from "../bet-history.module.scss";

const fontWeightClass = "font-weight-medium";
export const renderBetBase = (bet: BetLogs, t: TFunction, mainOdds: object, gameName: string, fractionalOddsFormat = false) => {
    if (bet.settlementResult) {
        const keysChoices = Object.keys(bet.settlementResult);
        return (
            <div className={`${Styles["list-choices"]} ${Styles[gameName]}`}>
                {keysChoices &&
                    keysChoices.map((name, index) => {
                        const classHighLight = bet.settlementResult[name] ? "font-weight-medium" : "";
                        if (bet[name] > 0) {
                            return (
                                <div key={index} className={classHighLight}>
                                    {t(`${gameName}:${name}`)}@
                                    <FormatNumber>{getBetOdds(bet, mainOdds, name, fractionalOddsFormat)}</FormatNumber>
                                </div>
                            );
                        }
                        return "";
                    })}
            </div>
        );
    }

    return <></>;
};

const getBetOdds = (bet: BetLogs, mainOdds: object, name: string, fractionalOddsFormat = false) => {
    const odds = bet.odds ? bet.odds : mainOdds;

    return fractionalOddsFormat && odds[name] ? numberWithCommas(+odds[name] - 1) : odds?.[name] || "";
};

const renderStake = (bet: BetLogs, freeBet: boolean) => {
    if (bet.settlementResult) {
        const keysChoices = Object.keys(bet.settlementResult);
        return (
            <>
                {keysChoices.map((name, index) => {
                    if (bet[name] > 0) {
                        return (
                            <div key={index} className={bet.settlementResult[name] ? fontWeightClass : ""}>
                                {freeBet ? 0 : numberWithCommas(bet[name])}
                            </div>
                        );
                    }
                    return null;
                })}
            </>
        );
    }

    return <></>;
};

const renderStakeRefund = (bet: BetLogs) => {
    if (bet.settlementResult) {
        return (
            <>
                <div className={bet.betwin > 0 ? fontWeightClass : ""}>{numberWithCommas(bet.amount)}</div>
                <div className={bet.refund > 0 ? Styles["refund"] : ""}>{numberWithCommas(bet.refund)}</div>
            </>
        );
    }

    return <></>;
};

const renderRefund = (bet: BetLogs) => {
    const refund = bet?.refund > 0 ? numberWithCommas(bet.refund) : 0;
    return (
        <>
            <div className={Styles["only-refund"]}>{refund}</div>
        </>
    );
};

const renderRound = ({ phien, freeBet }) => {
    return (
        <>
            <FormatNumber>{phien}</FormatNumber>
            {freeBet && (
                <div>
                    <img src={`/static/images/L2-cash/scoin.png`} className={Styles["scoin"]} alt="scoin" />
                </div>
            )}
        </>
    );
};

export const renderDataOnCell = (data: any, isHighligh: boolean, index: number) => {
    return (
        <td key={index} className={`${isHighligh ? "highlight" : ""}`}>
            {data}
        </td>
    );
};

export const renderTimes = ({ time }) => {
    return (
        <FormatNumber>
            <div className="time">{time && formatDate(new Date(time), "hh:mm:ss")}</div>
            <div className="date">{time && formatDate(new Date(time), "dd/MM/yy")}</div>
        </FormatNumber>
    );
};

const RenderCellOnTable: React.FC<{
    betHistoryItem: BetLogs;
    renderResult: (
        rowData: BetLogs,
        roundId?: number,
        setIsShowResultDetail?: Function,
        setBetLog?: Function,
        t?: TFunction
    ) => JSX.Element;
    renderBet: (rowData: BetLogs, t: TFunction, odds: object, gameName: string, fractionalOddsFormat: boolean | undefined) => {};
    t: TFunction;
    setIsShowResultDetail: Function;
    gameName: string;
    setIsShowBetLogDetails: Function;
    setBetLog: Function;
    headerName: string[];
    fractionalOddsFormat: boolean | undefined;
}> = ({
    betHistoryItem,
    renderResult,
    renderBet,
    setIsShowResultDetail,
    t,
    gameName,
    setIsShowBetLogDetails,
    setBetLog,
    headerName,
    fractionalOddsFormat,
}) => {
    const { time, phien, betwin, freeBet, totalAmount } = betHistoryItem;
    const odds = betHistoryItem.odds;
    const isHighligh = betwin > 0 ? true : false;
    const fontNumber = "font-number";
    const classBetWin = `font-weight-medium ${Styles["bet-win"]} ${fontNumber}`;

    const onClickTotalAmount = () => {
        setIsShowBetLogDetails(true);
        setBetLog({ bet: betHistoryItem, roundId: phien, t });
    };
    return (
        <>
            {headerName.map((name, index) => {
                switch (name) {
                    case "roundTime":
                        return renderDataOnCell(renderTimes({ time }), isHighligh, index);
                    case "round":
                        return renderDataOnCell(renderRound({ phien, freeBet }), isHighligh, index);
                    case "result":
                        return renderDataOnCell(
                            renderResult(betHistoryItem, phien, setIsShowResultDetail, setBetLog, t),
                            isHighligh,
                            index
                        );
                    case "choice":
                        return renderDataOnCell(renderBet(betHistoryItem, t, odds, gameName, fractionalOddsFormat), isHighligh, index);
                    case "stake":
                        return renderDataOnCell(
                            <div className={`${Styles["stake"]} ${fontNumber}`}>{renderStake(betHistoryItem, freeBet)}</div>,
                            isHighligh,
                            index
                        );
                    case "refund":
                        return renderDataOnCell(
                            <div className={`${Styles["stake"]} ${fontNumber}`}>{renderStakeRefund(betHistoryItem)}</div>,
                            isHighligh,
                            index
                        );
                    case "onlyRefund":
                        return renderDataOnCell(
                            <div className={`${Styles["only-refund"]} ${fontNumber}`}>{renderRefund(betHistoryItem)}</div>,
                            isHighligh,
                            index
                        );
                    case "totalStake":
                        return renderDataOnCell(
                            <div className={`${Styles["total-stake"]} ${fontNumber}`} onClick={() => onClickTotalAmount()}>
                                <FormatNumber>{totalAmount}</FormatNumber>
                            </div>,
                            isHighligh,
                            index
                        );
                    case "win":
                        return renderDataOnCell(
                            <div className={classBetWin}> {betwin && numberWithCommas(betwin)}</div>,
                            isHighligh,
                            index
                        );
                    default:
                        return <></>;
                }
            })}
        </>
    );
};

export default RenderCellOnTable;
