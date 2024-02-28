import { FC, useEffect, useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import BaseModal from "../base-modal";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameContext } from "../../../_shared/react-contexts";

const GET_HISTORY = "getHistory";
const HISTORY_EVENT = "history";

export interface BetHistoryTableProps {
    betLogs: any[];
    handleScroll: (event: any) => void;
    renderBetDetail: (betDetailProps: BetDetailProps) => JSX.Element;
    onCloseModal: Function;
}

export interface BetDetailProps {
    betLogDetails: any[];
    onCloseModal: Function;
    isShowBetDetail: boolean;
    drawInfo: {
        drawId: number;
        result: any,
        odds: any
        stake: any;
    }
}

export interface BetHistoryProps {
    renderBetHistoryTable: (betHistoryTableProps: BetHistoryTableProps) => JSX.Element;
    renderBetDetail: (betDetailProps: BetDetailProps) => JSX.Element;
    socket: Socket;
}

const BetHistoryModal: FC<BetHistoryProps> = ({ renderBetHistoryTable, renderBetDetail, socket }) => {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const { isShowBetHistory } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const [betLogs, setBetLogs] = useState([]);
    const [page, setPage] = useState<number>(0);
    const gameContext = useGameContext();

    const toggleBetHistory = () => {
        dispatch({
            type: GameEventActionType.TOGGLE_BET_HISTORY,
            payload: { isShowBetHistory: false }
        })
    }

    const handleScroll = (nextPage: number) => (event: any) => {
        const bottom = event.target.scrollHeight - event.target.scrollTop === event.target.clientHeight;
        if (bottom && !isFetching) {
            socket.emit(GET_HISTORY, { page: nextPage, pageSize: 10 });
            setIsFetching(true);
        }
    }

    useEffect(() => {
        gameContext.gameMessageHandler.register(HISTORY_EVENT, ({ history }) => {
            setIsFetching(false);
            if (history?.betLogs?.length > 0) {
                setBetLogs((x) => [...x, ...(history?.betLogs ?? [])]);
            }
        })
    }, [])

    useEffect(() => {
        if (isShowBetHistory) {
            socket.emit(GET_HISTORY, { page: 1, pageSize: 10 });
            setIsFetching(true);
        }
    }, [isShowBetHistory]);

    const handleCloseModal = () => {
        setPage(0);
        setBetLogs([]);
        toggleBetHistory();
    };

    const handleClose = () => {
        setIsOpen(x => !x);
    };

    return (
        <BaseModal isOpen={isShowBetHistory && isOpen} onCloseModal={handleCloseModal} title={"Bet History"}>
            {useMemo(
                    () => {
                        setPage(x => x + 1); 
                        if (betLogs?.length <= 0 && page == 0) {
                            return "No data to show";
                        }                
                        return renderBetHistoryTable({ betLogs, handleScroll: handleScroll(page + 1), onCloseModal: handleClose, renderBetDetail })
                    }, [betLogs])}
        </BaseModal>
    );
};

export default BetHistoryModal;
