import React, { useContext } from "react";

type GameActionsContextType = {
    placeBet: (betChoice: string, amount: number) => void;
    finishProcessingBet: Function;
    renderResultCollapse: () => React.ReactElement;
    setActiveScoreboardTab: Function;
    updateStatusShowResult: Function;
};
const GameActionsContext = React.createContext<Partial<GameActionsContextType>>({});
GameActionsContext.displayName = "GameActionsContext";

export const GameActionsContextProvider = GameActionsContext.Provider;
export const GameActionsContextConsumer = GameActionsContext.Consumer;
export const useGameActionContext = () => useContext(GameActionsContext);
