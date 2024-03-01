import { RoundStateHandler } from "../round-base/round-state-handler";
import { RoundState } from "../game-base/type";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { wholeTurn, showResult, beforeStartRound, switchRoundAnimation } = durations;
        const startSwitchRoundPointTime = wholeRound - showResult - beforeStartRound;
        const endSwitchRoundPointTime = startSwitchRoundPointTime - switchRoundAnimation;

        if (roundRemainingTime < startSwitchRoundPointTime && roundRemainingTime >= endSwitchRoundPointTime) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }): number {
        const { wholeRound, showResult, beforeStartRound, switchRoundAnimation } = durations;
        const endSwitchRoundPointTime = wholeRound - showResult - beforeStartRound - switchRoundAnimation;

        const turnRemainingTime =
            (remainingTime % durations.wholeTurn) - (remainingTime >= endSwitchRoundPointTime ? switchRoundAnimation : 0);

        return turnRemainingTime === 0 ? durations.wholeTurn : turnRemainingTime;
    }

    getWholeRoundDuration({ durations }): number {
        return durations.wholeTurn;
    }

    shouldCountDownTimer({ newRoundState }): boolean {
        return newRoundState !== RoundState.SwitchRound;
    }
}
