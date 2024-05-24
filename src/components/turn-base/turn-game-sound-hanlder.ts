import { RoundState } from "../game-base/type";
import { GameSoundHandler, GameSoundHandlerProps } from "../round-base/game-sound-handler";

export class TurnGameSoundHandler extends GameSoundHandler {
    constructor(protected readonly props: GameSoundHandlerProps) {
        super(props);
    }

    override playSound(newRoundState: RoundState) {
        const { startPlaceBetSound, startRoundSound } = this.props.gameSound();
        const soundByState = {
            [RoundState.BeforePlaceBet]: startRoundSound,
            [RoundState.InRound]: startPlaceBetSound,
        };
        soundByState[newRoundState]?.();
    }
}
