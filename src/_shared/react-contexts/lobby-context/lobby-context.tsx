import { createContext, useContext, useReducer } from "react";

import { ILobbyContextModel, initialLobbyContextModel } from "./lobby-context-model";
import { LobbyEventActionType, SettingEventAction } from "./lobby-event-action";

export const LobbyContext = createContext<Partial<ILobbyContextModel>>({});
export const LobbyDispatchContext = createContext(null);

LobbyContext.displayName = "LobbyContext";

export const LobbyContextProvider = ({ children }) => {
    const [lobbyContextModel, dispatch] = useReducer(lobbyReducer, initialLobbyContextModel());
    return (
        <LobbyContext.Provider value={lobbyContextModel}>
            <LobbyDispatchContext.Provider value={dispatch}>{children}</LobbyDispatchContext.Provider>
        </LobbyContext.Provider>
    );
};

export const useLobbyContext = () => useContext(LobbyContext);
export const useLobbyDispatch = () => useContext(LobbyDispatchContext);

const lobbyReducer = (state: any, action: SettingEventAction) => {
    const { type, payload } = action;
    const { lobbyConfigs } = payload;

    if (type === LobbyEventActionType.LOBBY_CONFIGS) {
        return {
            ...state,
            lobbyConfigs,
        };
    }

    throw Error("Unknown action: " + action.type);
};
