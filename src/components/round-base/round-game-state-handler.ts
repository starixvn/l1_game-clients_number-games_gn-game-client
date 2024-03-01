import { RoundState } from "../game-base/type";
import { GameStateHandler } from "../game-base/handlers/game-state-handler";

export class RoundGameStateHandler extends GameStateHandler {
    override shouldIncreaseRoundId({ nextRoundState, durations }): boolean {
        return durations.beforeStartRound ? nextRoundState === RoundState.BeforeStartRound : nextRoundState === RoundState.InRound;
    }
}
