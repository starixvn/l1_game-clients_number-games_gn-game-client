import { FC, useEffect, useMemo, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameContext } from "../../../_shared/react-contexts";
import { GameMessageHandler, messageEventType } from "../../game-base/handlers";
import Loader from "../loader";
import ModalContainer from "../modal-container";

const GET_HISTORY = "getHistory";
const HISTORY_EVENT = "history";

export interface BetLogProps {
    betLogs: any[];
    handleScroll: (event: any) => void;
    renderBetDetail: (betDetailProps: BetLogDetailProps) => JSX.Element;
    onCloseModal: Function;
}

export interface BetLogDetailProps {
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
    renderBetLog: (betLogProps: BetLogProps) => JSX.Element;
    renderBetLogDetail: (betLogDetailProps: BetLogDetailProps) => JSX.Element;
}

const BetHistoryModal: FC<BetHistoryProps> = ({ renderBetLog, renderBetLogDetail }) => {
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
            getHistory(gameContext.gameMessageHandler, nextPage);
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
            getHistory(gameContext.gameMessageHandler, 1);
            setIsFetching(true);
        }
    }, [isShowBetHistory]);

    const handleCloseModal = () => {
        setPage(0);
        setBetLogs([]);
        toggleBetHistory();
    };

    const handleCloseInBetDetail = () => {
        setIsOpen(x => !x);
    };

    return (
        <ModalContainer isOpen={isShowBetHistory && isOpen} title="Bet History" onCloseModal={handleCloseModal}>
            {useMemo(
                    () => {
                        setPage(x => x + 1); 
                        if (betLogs?.length <= 0 && page == 0) {
                            return <Loader />;
                        }                
                        return renderBetLog({ betLogs, handleScroll: handleScroll(page + 1), onCloseModal: handleCloseInBetDetail, renderBetDetail: renderBetLogDetail })
                    }, [betLogs])}
        </ModalContainer>
    )
};

const getHistory = (gameMessageHandler: GameMessageHandler, page: number) => {
    gameMessageHandler.broadcastGameEvent({ [messageEventType.SEND_SOCKET_MESSAGE]: { event: GET_HISTORY, data: { page: page } } });
};

export default BetHistoryModal;
