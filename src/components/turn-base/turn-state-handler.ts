import { RoundStateHandler } from "../round-base/round-state-handler";
import { RoundState } from "../game-base/type";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { wholeTurn, showResult, switchRoundAnimation } = durations;
        const startSwitchRoundPointTime = wholeRound - showResult;
        const endSwitchRoundPointTime = startSwitchRoundPointTime - switchRoundAnimation;

        if (startSwitchRoundPointTime >= roundRemainingTime && roundRemainingTime > endSwitchRoundPointTime) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }): number {
        const turnRemainingTime =
            this.getRoundRemainingTimeToCalculateTurnRemainingtime({ remainingTime, durations }) % durations.wholeTurn;

        if (turnRemainingTime <= 0) {
            return durations.wholeTurn;
        }

        return turnRemainingTime;
    }

    getRoundRemainingTimeToCalculateTurnRemainingtime({ remainingTime, durations }): number {
        const { wholeRound, showResult, switchRoundAnimation, beforePlaceBet } = durations;
        const startSwitchRoundPointTime = wholeRound - showResult;
        const endSwitchRoundPointTime = startSwitchRoundPointTime - switchRoundAnimation;

        if (remainingTime > startSwitchRoundPointTime) {
            return remainingTime - switchRoundAnimation;
        }

        if (startSwitchRoundPointTime >= remainingTime && remainingTime > endSwitchRoundPointTime - beforePlaceBet) {
            return endSwitchRoundPointTime - beforePlaceBet;
        }

        return remainingTime;
    }

    getWholeRoundDuration({ durations }) {
        return durations.wholeTurn;
    }

    shouldCountDownTimer({ newRoundState }): boolean {
        return newRoundState !== RoundState.SwitchRound;
    }
}
