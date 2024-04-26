import { GameStateHandler } from "../game-base/handlers/game-state-handler";
import { GameDurations, RoundState } from "../game-base/type";

export class TurnGameStateHandler extends GameStateHandler {
    override shouldIncreaseRoundId({ nextRoundState, durations }: { nextRoundState: RoundState; durations: GameDurations }): boolean {
        return durations.switchRoundAnimation ? nextRoundState === RoundState.SwitchRound : nextRoundState === RoundState.InRound;
    }
}
