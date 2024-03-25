import { createContext, useContext } from "react";
import { ILobbyContextModel } from "./lobby-context-model";

const LobbyContext = createContext<ILobbyContextModel>({});
LobbyContext.displayName = "LobbyContext";

export const LobbyContextProvider = LobbyContext.Provider;
export const LobbyContextConsumer = LobbyContext.Consumer;
export const useLobbyContext = () => useContext(LobbyContext);
