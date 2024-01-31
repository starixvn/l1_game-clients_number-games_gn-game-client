import { GameBaseProps, GameConfigs, GameState, ViewMode } from "../../components/shared/game-base/type";

export type GameContextModel = {
    totalBets: object;
    ownBets: object;
    gameSetting: GameBaseProps;
    roundId: number;
    remainingTime: number;
    gameConfigs: GameConfigs;
    gameState: GameState;
    viewMode: ViewMode;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    supportMD5: boolean;
    rate: number;
};
