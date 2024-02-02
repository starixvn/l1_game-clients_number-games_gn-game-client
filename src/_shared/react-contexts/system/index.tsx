import React from "react";

import { UserStakeLevel } from "../../../components/game-base/type";

type SystemContextType = {
    setFavorite: Function;
    favoriteGames: number[];
    enabledPlaySound: boolean;
    gamesOrder: number[];
    userStakeLevel: UserStakeLevel;
    betValue: number;
    enabledQuickBet: boolean;
    fractionalOddsFormat: boolean;
};

export const SystemContext = React.createContext<Partial<SystemContextType>>({});

SystemContext.displayName = "SystemContext";

export const SystemContextProvider = SystemContext.Provider;
export const SystemContextConsumer = SystemContext.Consumer;
export const useSystemContext = () => React.useContext(SystemContext);
