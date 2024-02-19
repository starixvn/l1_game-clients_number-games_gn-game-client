import { GameBaseProps, GameConfigs, GameState, ViewMode } from "../../components/shared/game-base/type";
import { MessageTransmitterType } from "../../helpers/message-transmitter/type";

export type GameContextModel = {
    ownBets: object;
    gameSetting: GameBaseProps;
    roundId: number;
    drawId: number;
    roundRemainingTime: number;
    remainingTime: number;
    gameConfigs: GameConfigs;
    gameState: GameState;
    viewMode: ViewMode;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    supportMD5: boolean;
    rate: number;
    messageTransmitter: MessageTransmitterType;
};
