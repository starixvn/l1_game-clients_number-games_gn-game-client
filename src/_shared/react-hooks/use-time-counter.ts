import { GameState } from "../../components/game-base/type";

export function useTimeCounter({ remainingTime, durations, gameState }) {
    switch (gameState) {
        case GameState.InRound:
        case GameState.LockingBet:
            return remainingTime;
        case GameState.BeforeStartRound:
            return durations.beforeStartRound;
        default:
            return 0;
    }
}
