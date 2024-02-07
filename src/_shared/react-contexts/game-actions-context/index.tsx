import React, { useContext } from "react";

import { Boundary, PopupType, Position, ViewMode } from "../../../components/game-base/type";

type GameActionsContextType = {
    placeBet: (betChoice: string, amount: number, betPosition?: Position, betOptionPosition?: Boundary) => void;
    openPopup: (type: PopupType) => void;
    closePopup: () => void;
    openPlaceBetModal: Function;
    updateViewMode: (mode: ViewMode) => void;
    playAcceptedBetAnimation: (amount: number, betPosition?: Position) => void;
    setActiveScoreboardTab: Function;
    updateStatusShowResult: Function;
};
const GameActionsContext = React.createContext<Partial<GameActionsContextType>>({});
GameActionsContext.displayName = "GameActionsContext";

export const GameActionsContextProvider = GameActionsContext.Provider;
export const GameActionsContextConsumer = GameActionsContext.Consumer;
export const useGameActionContext = () => useContext(GameActionsContext);
