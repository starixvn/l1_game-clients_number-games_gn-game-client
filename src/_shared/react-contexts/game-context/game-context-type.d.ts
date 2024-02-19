import { GameBaseProps, GameConfigs, GameState, ViewMode } from "../../components/shared/game-base/type";

export type GameContextModel = {
    ownBets: object;
    gameSetting: GameBaseProps;
    roundId: number;
    drawId: number;
    gameState: GameState;
    isShowBlink: boolean;
    supportMD5: boolean;
    rate: number;
};
