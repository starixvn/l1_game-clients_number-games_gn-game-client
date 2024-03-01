import { RoundState } from "../game-base/type";
import { GameStateHandler } from "../game-base/handlers/game-state-handler";

export class TurnGameStateHandler extends GameStateHandler {
    override shouldIncreaseRoundId({ nextRoundState, durations }): boolean {
        return durations.switchRoundAnimation ? nextRoundState === RoundState.SwitchRound : nextRoundState === RoundState.InRound;
    }
}
