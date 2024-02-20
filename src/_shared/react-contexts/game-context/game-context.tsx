import React, { useContext } from "react";
import { GameContextModel } from "./game-context-type";

export const GameContext = React.createContext<GameContextModel>({
    ownBets: {},
    rate: 1,
    gameSetting: {},
});
GameContext.displayName = "GameContext";

export const GameContextProvider = GameContext.Provider;
export const GameContextConsumer = GameContext.Consumer;
export const useGameContext = () => useContext(GameContext);
