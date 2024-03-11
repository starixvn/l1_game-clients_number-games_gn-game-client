import { RoundStateHandler } from "../round-base/round-state-handler";
import { RoundState } from "../game-base/type";

export class TurnStateHandler extends RoundStateHandler {
    constructor() {
        super();
    }

    determineRoundBaseState({ roundRemainingTime, wholeRound, remainingTime, durations }): RoundState {
        const { wholeTurn, showResult, switchRoundAnimation } = durations;
        const startSwitchRoundPoinTtime = wholeRound - showResult;
        const endSwitchRoundPointTime = startSwitchRoundPoinTtime - switchRoundAnimation;

        if (roundRemainingTime < startSwitchRoundPoinTtime && roundRemainingTime >= endSwitchRoundPointTime) {
            return RoundState.SwitchRound;
        }

        return super.determineRoundBaseState({ roundRemainingTime, wholeRound: wholeTurn, remainingTime, durations });
    }

    getRemainingTime({ remainingTime, durations }): number {
        const { wholeRound, showResult, switchRoundAnimation, wholeTurn } = durations;
        const endSwitchRoundPointTime = wholeRound - showResult - switchRoundAnimation;
        const turnRemainingTimeTmp = remainingTime % wholeTurn;

        const turnRemainingTime =
            remainingTime >= endSwitchRoundPointTime ? turnRemainingTimeTmp - switchRoundAnimation : turnRemainingTimeTmp;

        return turnRemainingTime <= 0 ? wholeTurn : turnRemainingTime;
    }

    getWholeRoundDuration({ durations }) {
        return durations.wholeTurn;
    }

    shouldCountDownTimer({ newRoundState }): boolean {
        return newRoundState !== RoundState.SwitchRound;
    }
}
