import { RoundState } from "../game-base/type";
import { GameStateHandler } from "../game-base/handlers/game-state-handler";

export class RoundGameStateHandler extends GameStateHandler {
    override shouldIncreaseRoundId({ nextRoundState, durations }): boolean {
        return durations.beforePlaceBet ? nextRoundState === RoundState.BeforePlaceBet : nextRoundState === RoundState.InRound;
    }
}
