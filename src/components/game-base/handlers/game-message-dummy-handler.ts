import { useEffect, useRef } from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { messageEventType } from ".";
import { RoundState } from "../type";

export const GameMessageDummyHandler = ({ gameMessageHandler }) => {
    const { roundState, isUMInFirstLoad } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const roundStateRef = useRef<RoundState>(roundState);
    useEffect(() => {
        roundStateRef.current = roundState;
    }, [roundState]);

    useEffect(() => {
        const handleRoundHistory = ({ roundHistory, roundId }) => {
            const currentRoundState = roundStateRef.current;

            dispatch({
                type: GameEventActionType.ROUND_HISTORY,
                payload: {
                    roundHistory: roundHistory,
                    roundId: [RoundState.DisplayResult].includes(currentRoundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                    settlementResult: currentRoundState === RoundState.LockingBet ? {} : roundHistory[0]?.settlementResult,
                    playResultAnimation: [RoundState.DisplayResult].includes(currentRoundState) || isUMInFirstLoad ? false : true,
                    showResultInfo: [RoundState.DisplayResult].includes(currentRoundState) || isUMInFirstLoad ? true : false,
                },
            });
        };

        gameMessageHandler.register(messageEventType.ROUND_HISTORY, handleRoundHistory);
    }, []);

    return null;
};
