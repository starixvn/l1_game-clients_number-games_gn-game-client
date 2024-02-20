import { RoundState } from "../../components/game-base/type";

export function useTimeCounter({ remainingTime, durations, gameState }) {
    switch (gameState) {
        case RoundState.InRound:
        case RoundState.LockingBet:
            return remainingTime;
        case RoundState.BeforeStartRound:
            return durations.beforeStartRound;
        default:
            return 0;
    }
}
