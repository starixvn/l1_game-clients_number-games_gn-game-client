import { RoundState, PopupType } from "../../components/game-base/type";
import { useTimeCounter } from "./use-time-counter";

export function useDetermineRoundState({ roundRemainingTime, remainingTime, durations }) {
    if (roundRemainingTime > durations.wholeRound - durations.switchRoundAnimation) {
        return RoundState.SwitchRound;
    }

    if (remainingTime >= durations.wholeTurn - durations.showResult) {
        return RoundState.DisplayResult;
    }

    if (durations.beforeStartRound && remainingTime > durations.placingBets) {
        return RoundState.BeforeStartRound;
    }

    if (remainingTime <= durations.placingBets && remainingTime > durations.lockingBet) {
        return RoundState.InRound;
    }

    if (remainingTime <= durations.lockingBet && remainingTime >= 0) {
        return RoundState.LockingBet;
    }

    return RoundState.None;
}

export function useNextRoundState({
    gameStateContextModel,
    nextRoundState,
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
            roundState: nextRoundState,
        });

        // if (nextGameState === RoundState.InRound) {
        //     this.betWin = 0;
        // }

        if (nextRoundState === RoundState.LockingBet) {
            // removeBetChoiceFocus && removeBetChoiceFocus();
        }

        const newStateDetector = [
            {
                condition: nextRoundState === RoundState.InRound,
                state: {
                    betWin: 0,
                },
            },
            {
                condition: [RoundState.BeforeStartRound, RoundState.InRound].includes(nextRoundState),
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
                condition: durations.beforeStartRound
                    ? nextRoundState === RoundState.BeforeStartRound
                    : nextRoundState === RoundState.InRound,
            },
            {
                condition: nextRoundState === RoundState.LockingBet,
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
