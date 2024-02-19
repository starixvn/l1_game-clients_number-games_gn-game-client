import React, { useContext } from "react";

import { GameState } from "../../../components/game-base/type";
import { GameContextModel } from "./game-context-type";

export const GameContext = React.createContext<GameContextModel>({
    roundId: 0,
    drawId: 0,
    gameState: GameState.None,
    ownBets: {},
    gameSetting: null,
    isShowBlink: false,
    supportMD5: false,
    rate: 1,
});
GameContext.displayName = "GameContext";

export const GameContextProvider = GameContext.Provider;
export const GameContextConsumer = GameContext.Consumer;
export const useGameContext = () => useContext(GameContext);
