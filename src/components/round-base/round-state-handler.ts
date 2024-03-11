import { RoundState } from "../game-base/type";

export interface IRoundStateHandler {
    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState;
    getRemainingTime({ remainingTime, durations }): number;
    getWholeRoundDuration({ durations }): number;
    shouldCountDownTimer({ newRoundState }): boolean;
}

export class RoundStateHandler implements IRoundStateHandler {
    constructor() {}
    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { showResult, beforePlaceBet, placingBets, lockingBet } = durations;

        if (remainingTime > wholeRound - showResult) {
            return RoundState.DisplayResult;
        }

        if (beforePlaceBet > 0 && remainingTime > placingBets) {
            return RoundState.BeforePlaceBet;
        }

        if (remainingTime <= placingBets && remainingTime > lockingBet) {
            return RoundState.InRound;
        }

        if (remainingTime <= lockingBet && remainingTime >= 0) {
            return RoundState.LockingBet;
        }

        return RoundState.None;
    }

    getRemainingTime({ remainingTime, durations }): number {
        return remainingTime;
    }

    getWholeRoundDuration({ durations }): number {
        return durations.wholeRound;
    }

    shouldCountDownTimer({ newRoundState }): boolean {
        return newRoundState !== RoundState.BeforePlaceBet;
    }
}
