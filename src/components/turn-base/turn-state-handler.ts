import { RoundStateHandler } from "../round-base/round-state-handler";
import { RoundState } from "../game-base/type";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { wholeTurn, showResult, beforeStartRound, switchRoundAnimation } = durations;

        if (
            roundRemainingTime < wholeRound - showResult - beforeStartRound &&
            roundRemainingTime >= wholeRound - showResult - beforeStartRound - switchRoundAnimation
        ) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }): number {
        const { wholeRound, showResult, beforeStartRound, switchRoundAnimation } = durations;

        const turnRemainingTime =
            remainingTime >= wholeRound - showResult - beforeStartRound - switchRoundAnimation
                ? (remainingTime % durations.wholeTurn) - durations.switchRoundAnimation
                : remainingTime % durations.wholeTurn;

        return turnRemainingTime === 0 ? durations.wholeTurn : turnRemainingTime;
    }

    getWholeRoundDuration({ durations }) {
        return durations.wholeTurn;
    }
}
