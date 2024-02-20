import { GameState, PopupType } from "../../components/game-base/type";
import { useTimeCounter } from "./use-time-counter";

export function useDetermineGameState({ roundRemainingTime, remainingTime, durations }) {
    if (roundRemainingTime > durations.wholeRound - durations.switchRoundAnimation) {
        return GameState.SwitchRound;
    }

    if (remainingTime > durations.wholeTurn) {
        return GameState.BalancingBet;
    }

    if (remainingTime >= durations.wholeTurn - durations.showResult) {
        return GameState.DisplayResult;
    }

    if (durations.beforeStartRound && remainingTime > durations.placingBets) {
        return GameState.BeforeStartRound;
    }

    if (remainingTime <= durations.placingBets && remainingTime > durations.lockingBet) {
        return GameState.InRound;
    }

    if (remainingTime <= durations.lockingBet && remainingTime >= 0) {
        return GameState.LockingBet;
    }

    return GameState.None;
}

export function useGetStateByNextGameState({
    gameStateContextModel,
    nextGameState,
    durations,
    defaultResult,
    defaultSettlementResult,
    remainingTime,
}) {
    // const gameStateContextModel = useGameStateContext();
    if (gameStateContextModel) {
        const { displayPopup, notice, removeBetChoiceFocus, result, settlementResult } = gameStateContextModel;

        const getTimeCounter = useTimeCounter;
        const timeCounter = getTimeCounter({
            remainingTime,
            durations: durations,
            gameState: nextGameState,
        });

        // if (nextGameState === GameState.InRound) {
        //     this.betWin = 0;
        // }

        if (nextGameState === GameState.LockingBet) {
            // removeBetChoiceFocus && removeBetChoiceFocus();
        }

        const newStateDetector = [
            {
                condition: nextGameState === GameState.InRound,
                state: {
                    betWin: 0,
                },
            },
            {
                condition: [GameState.BeforeStartRound, GameState.InRound].includes(nextGameState),
                state: {
                    ownBets: {},
                    totalBets: {},
                    showWinningAnimation: false,
                    isShowBlink: false,
                    playResultAnimation: false,
                    showResultInfo: false,
                    showMD5ResultKey: false,
                },
            },
            {
                condition: durations.beforeStartRound ? nextGameState === GameState.BeforeStartRound : nextGameState === GameState.InRound,
            },
            {
                condition: nextGameState === GameState.LockingBet,
                state: {
                    isShowBlink: true,
                    displayPopup: [PopupType.Rebet, PopupType.PlaceBet].includes(displayPopup) ? null : displayPopup,
                    notice: [PopupType.Rebet, PopupType.PlaceBet].includes(displayPopup) ? null : notice,
                    result: defaultResult ?? result,
                    settlementResult: defaultSettlementResult ?? settlementResult,
                },
            },
        ];

        return newStateDetector.reduce(
            (newState, stateDetector) => {
                if (stateDetector.condition) {
                    newState = Object.assign(newState, stateDetector.state);
                }

                return newState;
            },
            { remainingTime: timeCounter }
        );
    }
}
