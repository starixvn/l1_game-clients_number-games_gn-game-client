import { PopupType, RoundState } from "../../components/game-base/type";

export function getTimeCounter({ remainingTime, durations, roundState }) {
    switch (roundState) {
        case RoundState.InRound:
        case RoundState.LockingBet:
            return remainingTime;
        case RoundState.BeforeStartRound:
            return durations.beforeStartRound;
        default:
            return 0;
    }
}

export function determineRoundBaseState({ wholeRound, remainingTime, durations }) {
    const { showResult, beforeStartRound, placingBets, lockingBet } = durations;

    if (remainingTime >= wholeRound - showResult) {
        return RoundState.DisplayResult;
    }

    if (beforeStartRound && remainingTime > placingBets) {
        return RoundState.BeforeStartRound;
    }

    if (remainingTime <= placingBets && remainingTime > lockingBet) {
        return RoundState.InRound;
    }

    if (remainingTime <= lockingBet && remainingTime >= 0) {
        return RoundState.LockingBet;
    }

    return RoundState.None;
}

export function determineTurnBaseState({ roundRemainingTime, remainingTime, durations }) {
    const { wholeRound, wholeTurn, showResult, beforeStartRound, switchRoundAnimation } = durations;

    if (
        roundRemainingTime < wholeRound - showResult - beforeStartRound &&
        roundRemainingTime >= wholeRound - showResult - beforeStartRound - switchRoundAnimation
    ) {
        return RoundState.SwitchRound;
    }

    return determineRoundBaseState({ wholeRound: wholeTurn, remainingTime, durations });
}

export function getNextRoundState({
    gameStateContextModel,
    nextRoundState,
    durations,
    defaultResult,
    defaultSettlementResult,
    remainingTime,
}) {
    // const gameStateContextModel = useGameStateContext();
    if (gameStateContextModel) {
        const { displayPopup, notice, result, settlementResult } = gameStateContextModel;

        const timeCounter = getTimeCounter({
            remainingTime,
            durations: durations,
            roundState: nextRoundState,
        });

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
                    notConfirmOwnBets: {},
                    showConfirmBet: false,
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
