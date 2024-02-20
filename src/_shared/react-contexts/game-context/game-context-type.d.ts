import { GameBaseProps, GameConfigs, GameState, ViewMode } from "../../components/shared/game-base/type";

export type GameContextModel = {
    ownBets: object;
    gameSetting: GameBaseProps;
    rate: number;
};
