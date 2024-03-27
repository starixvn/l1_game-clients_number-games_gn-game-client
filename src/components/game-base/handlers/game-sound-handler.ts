import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { GameSound, RoundState } from "../type";

export type GameSoundHandlerProps = {
    gameSound(): GameSound;
};

export class GameSoundHandler {
    constructor(private props: GameSoundHandlerProps) {}

    handleSound = (roundState: RoundState) => {
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? false;
        enableSound && this.playSound(roundState);
    };

    private playSound(roundState: RoundState) {
        const { receiveFinishSound, startRoundSound } = this.props.gameSound();
        switch (roundState) {
            case RoundState.LockingBet:
                receiveFinishSound();
                break;

            case RoundState.DisplayResult:
                startRoundSound();
                break;
        }
    }
}
