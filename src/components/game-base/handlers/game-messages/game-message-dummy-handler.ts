import { useEffect } from "react";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { messageEventType } from "..";
import { RoundState } from "../../type";

export const GameMessageDummyHandler = ({ gameMessageHandler }) => {
    const gameStateContext = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    useEffect(() => {
        gameMessageHandler.register(messageEventType.ROUND_HISTORY, handleRoundHistory);
    }, []);

    const handleRoundHistory = ({ roundHistory, roundId }) => {
        const { roundState, isUMInFirstLoad } = gameStateContext;

        dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                settlementResult: roundState === RoundState.LockingBet ? {} : roundHistory[0]?.settlementResult,
                playResultAnimation: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? false : true,
                showResultInfo: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? true : false,
            },
        });
    };

    return null;
};
