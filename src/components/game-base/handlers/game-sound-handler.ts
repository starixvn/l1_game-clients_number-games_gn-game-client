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
        const { startDrawSound, startRoundSound } = this.props.gameSound();
        switch (newRoundState) {
            case RoundState.SwitchRound:
                startRoundSound();
                break;
            case RoundState.InRound:
                startDrawSound();
                break;
        }
    }
}
