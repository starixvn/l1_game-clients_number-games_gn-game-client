import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { GameSound, RoundState } from "../type";

export type GameSoundHandlerProps = {
    gameSound(): GameSound;
};

export class GameSoundHandler {
    constructor(private readonly props: GameSoundHandlerProps) {}

    handleSound = (roundState: RoundState) => {
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        enableSound && this.playSound(roundState);
    };

    private playSound(roundState: RoundState) {
        const { startRoundSound } = this.props.gameSound();
        switch (roundState) {
            case RoundState.DisplayResult:
                startRoundSound();
                break;
        }
    }
}
