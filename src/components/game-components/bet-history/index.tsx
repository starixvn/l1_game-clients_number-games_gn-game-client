import { FC, useEffect, useMemo, useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameMessageHandler, messageEventType } from "../../game-base/handlers";
import Loader from "../loader";
import ModalContainer from "../modal-container";
import Styles from "./bet-history.module.scss";
import { useCommonTranslate, useSNTranslate } from "../../../_shared/react-hooks/use-translator";

const GET_HISTORY = "getHistory";
const HISTORY_EVENT = "history";

export interface BetLogProps {
    betLogs: any[];
    handleScroll: (event: any) => void;
    renderBetDetail: (betDetailProps: BetLogDetailProps) => JSX.Element;
    onCloseModal: Function;
    isLoadMore: boolean;
}

export interface BetLogDetailProps {
    betLogDetails: any[];
    onCloseModal: Function;
    isShowBetDetail: boolean;
    isLoadMore: boolean;
    drawInfo: {
        drawId: number;
        result: any;
        odds: any;
        settlementResult: any;
    };
}

export interface BetHistoryProps {
    renderBetLog: (betLogProps: BetLogProps) => JSX.Element;
    renderBetLogDetail: (betLogDetailProps: BetLogDetailProps) => JSX.Element;
}

const BetHistoryModal: FC<BetHistoryProps> = ({ renderBetLog, renderBetLogDetail }) => {
    const [isShowBetDetail, setIsShowBetDetail] = useState<boolean>(false);
    const [isFetching, setIsFetching] = useState<boolean>(true);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isHaveMoreData, setIsHaveMoreData] = useState<boolean>(true);
    const { isShowBetHistory } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const [betLogs, setBetLogs] = useState([]);
    const [page, setPage] = useState<number>(0);
    const gameContext = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();

    const toggleBetHistory = () => {
        dispatch({
            type: GameEventActionType.TOGGLE_BET_HISTORY,
            payload: { isShowBetHistory: false },
        });
    };

    const handleScroll = (nextPage: number) => (event: any) => {
        const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
        if (bottom && !isFetching) {
            getHistory(gameContext.gameMessageHandler, nextPage);
            setIsFetching(true);
        }
    };

    useEffect(() => {
        gameContext.gameMessageHandler.register(HISTORY_EVENT, ({ history }) => {
            setIsFetching(false);
            if (history?.betLogs?.length > 0) {
                setBetLogs((x) => [...x, ...(history?.betLogs ?? [])]);
            } else {
                setIsHaveMoreData(false);
            }
        });
    }, []);

    useEffect(() => {
        if (isShowBetHistory) {
            getHistory(gameContext.gameMessageHandler, 1);
            setIsFetching(true);
            setIsFirstLoad(false);
        }
    }, [isShowBetHistory]);

    const handleCloseModal = () => {
        setPage(0);
        setBetLogs([]);
        toggleBetHistory();
    };

    const handleCloseInBetDetail = () => {
        setIsShowBetDetail((stateShowBetDetail) => !stateShowBetDetail);
    };

    return (
        <ModalContainer
            isOpen={isShowBetHistory && !isShowBetDetail}
            title={translateCommon("bet_history")}
            onCloseModal={handleCloseModal}
        >
            {useMemo(() => {
                setPage((x) => x + 1);
                if (isFirstLoad) {
                    return (
                        <div className={Styles["history-loading"]}>
                            <Loader />
                        </div>
                    );
                }
                if (betLogs?.length <= 0) {
                    return <div className="text-center">{translateSNGames("table_no_data")}</div>;
                }
                return renderBetLog({
                    betLogs,
                    handleScroll: handleScroll(page + 1),
                    onCloseModal: handleCloseInBetDetail,
                    renderBetDetail: renderBetLogDetail,
                    isLoadMore: isHaveMoreData,
                });
            }, [betLogs, isHaveMoreData])}
        </ModalContainer>
    );
};

const getHistory = (gameMessageHandler: GameMessageHandler, page: number) => {
    gameMessageHandler.broadcastGameEvent({ [messageEventType.SEND_SOCKET_MESSAGE]: { event: GET_HISTORY, data: { page: page } } });
};

export default BetHistoryModal;
