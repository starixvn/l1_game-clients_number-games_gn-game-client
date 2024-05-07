import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { GameSound, RoundState } from "../type";

export type GameSoundHandlerProps = {
    gameSound(): GameSound;
};

export class GameSoundHandler {
    constructor(private readonly props: GameSoundHandlerProps) {}

    handleSound = (newRoundState: RoundState) => {
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        enableSound && this.playSound(newRoundState);
    };

    private playSound(newRoundState: RoundState) {
        const { startDrawSound, startRoundSound, blockBetSound } = this.props.gameSound();
        const soundByState = {
            [RoundState.SwitchRound]: startRoundSound,
            [RoundState.InRound]: startDrawSound,
            [RoundState.LockingBet]: blockBetSound,
        };
        soundByState[newRoundState] && soundByState[newRoundState]();
    }
}
