import React, { useEffect, useState, useMemo } from "react";
import { useTranslation, TFunction } from "next-i18next";
import { useRouter } from "next/router";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import RenderCellOnTable, { renderBetBase } from "./bet-row";
import { getAppSettings } from "../../../../../_shared/app-settings";
import { useAuthContext } from "../../../../../_shared/react-contexts";
import { clearSession } from "../../../../../services/auth-service";
import { BetLogs, PropsBetContainer, ResultDetail } from "./bet-history";
import Loader from "../../../../game-components/loader";
import { GamesIdKenoMatch, GamesIdMiniKeno, NUMBER_ROWS_DISPLAY, InfiniteLoadBeginEdgeOffset } from "./constants";
import BetHistoryDetailsContainer from "./log-details";
import Styles from "./bet-history.module.scss";
import { buildUrlWithPath } from "../../../../../_shared/helpers/url-helper";

let totalPage = 0;
let isFetchingHistory = false;

export const FormatNumber: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    return <span className={`font-number nowrap ${Styles["number-text"]}`}>{children}</span>;
};

export const RenderHeaderRows: React.FC<{ headerName: string[]; t: TFunction }> = ({ headerName, t }) => {
    return useMemo(() => {
        return (
            <tr>
                {headerName.map((name: string, index: number) => {
                    switch (name) {
                        case "roundTime":
                            return RenderRow(index, t("roundTime"));
                        case "round":
                            return RenderRow(index, t("round"));
                        case "result":
                            return RenderRow(index, t("result"));
                        case "choice":
                            return RenderRow(index, t("choice"));
                        case "stake":
                            return RenderRow(index, t("stake"));
                        case "refund":
                            return (
                                <th key={index}>
                                    {t("stake")} <br></br> {t("refund")}
                                </th>
                            );
                        case "onlyRefund":
                            return RenderRow(index, t("onlyRefund"));
                        case "totalStake":
                            return RenderRow(index, t("totalStake"));
                        case "betType":
                            return RenderRow(index, t("betType"));
                        case "betChoice":
                            return RenderRow(index, t("betChoice"));
                        case "win":
                            return RenderRow(index, t("win"));
                        default:
                            return <></>;
                    }
                })}
            </tr>
        );
    }, [headerName, t]);
};

export const RenderRow = (index: number, name: string) => {
    return <th key={index}>{name}</th>;
};

const sendPostBetHistory = async ({
    gameId,
    gameSetting,
    proxy,
    session,
    page,
    setIsFirstLoad,
    router,
    setListBetHistory,
    listBetHistory,
    setIsShowMessageError,
    language,
}) => {
    const pathUrlHistory =
        GamesIdKenoMatch.includes(gameId) || GamesIdMiniKeno.includes(gameId)
            ? `${gameSetting?.socketInfo?.path}/api/${gameSetting?.socketInfo?.namespace}/history`
            : `${gameSetting?.socketInfo?.path}/api/history`;
    const historyAPI = buildUrlWithPath(`${proxy.path}/${pathUrlHistory}`);
    isFetchingHistory = true;

    try {
        const resp = await axios.post(historyAPI, {
            session: session.ss,
            page: page,
            pageSize: NUMBER_ROWS_DISPLAY,
            username: session.username,
        });
        const bets = resp.data.history;
        fetchBetHistory({ betHistory: bets, setListBetHistory, listBetHistory });
        setIsFirstLoad(false);
        if (page === 1) {
            totalPage = Math.ceil(bets.total / NUMBER_ROWS_DISPLAY);
        }
    } catch (err) {
        if (err?.response?.status === 401) {
            clearSession();
            router.push("/timeout", "/timeout", { locale: language });
        }
        setIsFirstLoad(false);
        setIsShowMessageError(true);
    }
};

const fetchBetHistory = ({ betHistory, setListBetHistory, listBetHistory }) => {
    if (betHistory && betHistory.betLogs.length > 0) {
        const data = betHistory.betLogs;
        setListBetHistory([...listBetHistory, ...data]);

        isFetchingHistory = false;
    }
};

const getHeaderName = ({ nameHeaderOnTable, isRefund }) => {
    const headerNameDefault = ["roundTime", "round", "result", "choice", isRefund ? "refund" : "stake", "win"];
    return nameHeaderOnTable ? nameHeaderOnTable : headerNameDefault;
};

const handleScrollBetHistory = ({ event, page, setPage }) => {
    if (Math.ceil(event.target.offsetHeight + event.target.scrollTop) < event.target.scrollHeight - InfiniteLoadBeginEdgeOffset) {
        return;
    }

    if (page + 1 <= totalPage && !isFetchingHistory) {
        setPage(page + 1);
    }
};

const BetHistoryContainer = (props: PropsBetContainer) => {
    const { renderResult, isRefund, gameId, renderResultDetail, renderBetLogsDetails, closeModal, fractionalOddsFormat } = props;
    let { renderBet } = props;
    if (!props.renderBet) {
        renderBet = renderBetBase;
    }
    const router = useRouter();
    const { session } = useAuthContext();
    const [listBetHistory, setListBetHistory] = useState<object[]>([]);
    const [page, setPage] = useState<number>(1);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isShowResultDetail, setIsShowResultDetail] = useState<boolean>(false);
    const [betLog, setBetLog] = useState<ResultDetail>();
    const [isShowBetLogDetails, setIsShowBetLogDetails] = useState<boolean>(false);
    const [isShowMessageError, setIsShowMessageError] = useState<boolean>(false);
    const headerName = getHeaderName({ nameHeaderOnTable: props.nameHeaderOnTable, isRefund });
    const gameSetting = getAppSettings()?.gameSettings[gameId];
    const gameName = gameSetting?.gameName.toLowerCase();
    const { t, i18n } = useTranslation(["bethistory", gameName]);

    useEffect(() => {
        sendPostBetHistory({
            gameId,
            gameSetting,
            proxy: getAppSettings()?.proxy,
            session,
            page,
            setIsFirstLoad,
            router,
            listBetHistory,
            setListBetHistory,
            setIsShowMessageError,
            language: i18n.language,
        });
        return () => {
            setIsFirstLoad(true);
            setIsShowMessageError(false);
        };
    }, [page]);

    return useMemo(() => {
        const closeModalResultDetail = () => {
            setIsShowResultDetail(false);
        };

        const closeModalBetLogDetails = () => {
            setIsShowBetLogDetails(false);
        };

        if (isFirstLoad) {
            return (
                <div className={Styles["history-loading"]} data-testid="bet-history-loading">
                    <Loader></Loader>
                </div>
            );
        }

        if (isShowMessageError) {
            return <>{t("apiConnectFailed")}</>;
        }

        if (isShowBetLogDetails) {
            return (
                <BetHistoryDetailsContainer
                    renderBetLogsDetails={renderBetLogsDetails({
                        betLog,
                        gameName,
                        t,
                        setIsShowResultDetail,
                        gameId,
                        fractionalOddsFormat,
                    })}
                    renderResultDetail={renderResultDetail(betLog, t, closeModalResultDetail, gameName, gameId)}
                    isShowResultDetail={isShowResultDetail}
                    closeModalBetDetails={closeModalBetLogDetails}
                    closeModalBetHistory={closeModal}
                    translateText={{ betDetails: t("betDetails") }}
                ></BetHistoryDetailsContainer>
            );
        }

        return (
            <>
                {listBetHistory.length > 0 ? (
                    <div
                        className="table-container react-infinite-table"
                        onScroll={(e) => handleScrollBetHistory({ event: e, page, setPage })}
                        data-testid="bet-history"
                    >
                        <table key={uuidv4()} className="table text-center">
                            <thead>
                                <RenderHeaderRows headerName={headerName} t={t} />
                            </thead>
                            <tbody>
                                {listBetHistory.map((bet: BetLogs) => {
                                    return (
                                        <tr key={bet.phien} className={bet.betwin > 0 ? "highlight" : ""}>
                                            {RenderCellOnTable({
                                                betHistoryItem: bet,
                                                renderResult: renderResult,
                                                renderBet: renderBet,
                                                setIsShowResultDetail: setIsShowResultDetail,
                                                setIsShowBetLogDetails: setIsShowBetLogDetails,
                                                setBetLog: setBetLog,
                                                gameName: gameName,
                                                t: t,
                                                headerName: headerName,
                                                fractionalOddsFormat: fractionalOddsFormat,
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <span data-testid="bet-history-no-data">{t("noBetHistory")}</span>
                )}

                {isShowResultDetail && renderResultDetail(betLog, t, closeModalResultDetail, gameName, gameId)}
            </>
        );
    }, [isFirstLoad, listBetHistory, isShowResultDetail, isShowBetLogDetails, isShowMessageError]);
};

export default BetHistoryContainer;
