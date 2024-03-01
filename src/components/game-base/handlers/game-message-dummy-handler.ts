import { useEffect, useRef } from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { messageEventType } from ".";
import { RoundState } from "../type";

export const GameMessageDummyHandler = ({ gameMessageHandler }) => {
    const { roundState, isUMInFirstLoad, betWin } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const betWinRef = useRef<number>(betWin);
    const roundStateRef = useRef<RoundState>(roundState);

    useEffect(() => {
        betWinRef.current = betWin;
    }, [betWin]);

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

        const shouldCallUpdateBalanceAfterWinningAnimation = () => {
            betWinRef.current > 0 && gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: {} });
        };

        gameMessageHandler.register(messageEventType.ROUND_HISTORY, handleRoundHistory);
        gameMessageHandler.register(
            messageEventType.SHOULD_GET_BALANCE_AFTER_WINNING_ANIMATION,
            shouldCallUpdateBalanceAfterWinningAnimation
        );
    }, []);

    return null;
};
