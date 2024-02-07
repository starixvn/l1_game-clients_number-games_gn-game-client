import { GameBaseProps, GameConfigs, GameState, ViewMode } from "../../components/shared/game-base/type";

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
    rate: number;
    messageTransmitter: MessageTransmitterType;
    result: object;
    settlementResult: object;
};
