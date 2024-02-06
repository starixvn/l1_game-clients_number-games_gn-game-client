import React, { useContext } from "react";

import { GameState, ViewMode } from "../../../components/game-base/type";
import { GameContextModel } from "./game-context-type";

export const GameContext = React.createContext<GameContextModel>({
    roundId: 0,
    drawId: 0,
    gameState: GameState.None,
    roundRemainingTime: 0,
    remainingTime: 0,
    ownBets: {},
    gameSetting: null,
    gameConfigs: null,
    viewMode: ViewMode.full,
    playResultAnimation: false,
    isShowBlink: false,
    supportMD5: false,
    rate: 1,
});
GameContext.displayName = "GameContext";

export const GameContextProvider = GameContext.Provider;
export const GameContextConsumer = GameContext.Consumer;
export const useGameContext = () => useContext(GameContext);
