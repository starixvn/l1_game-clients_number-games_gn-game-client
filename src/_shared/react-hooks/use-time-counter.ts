import { RoundState } from "../../components/game-base/type";

export function useTimeCounter({ remainingTime, durations, roundState }) {
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
