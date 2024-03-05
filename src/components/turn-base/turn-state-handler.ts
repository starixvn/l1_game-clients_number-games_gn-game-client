import { RoundStateHandler } from "../round-base/round-state-handler";
import { RoundState } from "../game-base/type";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { wholeTurn, showResult, beforeStartRound, switchRoundAnimation } = durations;

        if (roundRemainingTime < wholeRound - showResult && roundRemainingTime >= wholeRound - showResult - switchRoundAnimation) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }): number {
        const { wholeRound, showResult, beforeStartRound, switchRoundAnimation } = durations;

        const turnRemainingTime =
            remainingTime >= wholeRound - showResult - switchRoundAnimation
                ? (remainingTime % durations.wholeTurn) - durations.switchRoundAnimation
                : remainingTime % durations.wholeTurn;

        return turnRemainingTime <= 0 ? durations.wholeTurn : turnRemainingTime;
    }

    getWholeRoundDuration({ durations }) {
        return durations.wholeTurn;
    }

    shouldCountDownTimer({ newRoundState }): boolean {
        // console.log(`\x1B[31m newRoundState ${RoundState[newRoundState]}}`);
        return newRoundState !== RoundState.SwitchRound;
    }
}
