import React, { createContext, useContext, useReducer } from "react";

import { SystemEventAction, SystemEventActionType } from "./system-event-action";
import { SystemContextModel, initialSystemContextModel } from "./system-context-model";

export const SystemContext = createContext<Partial<SystemContextModel>>({});
export const SystemDispatchContext = createContext(null);

SystemContext.displayName = "SystemContext";

export const SystemContextProvider = ({ children }) => {
    const [gameStateContextModel, dispatch] = useReducer(systemReducer, initialSystemContextModel());
    return (
        <SystemContext.Provider value={gameStateContextModel}>
            <SystemDispatchContext.Provider value={dispatch}>{children}</SystemDispatchContext.Provider>
        </SystemContext.Provider>
    );
};

export const useSystemContext = () => useContext(SystemContext);
export const useSystemDispatch = () => useContext(SystemDispatchContext);

const systemReducer = (state: any, action: SystemEventAction) => {
    const { type, payload } = action;
    const { selectedChip, enabledQuickBet, enabledSound } = payload;

    switch (type) {
        case SystemEventActionType.SELECT_CHIP: {
            return {
                ...state,
                selectedChip,
            };
        }
        case SystemEventActionType.ENABLE_QUICK_BET: {
            return {
                ...state,
                enabledQuickBet,
            };
        }
        case SystemEventActionType.ENABLE_SOUND: {
            return {
                ...state,
                enabledSound,
            };
        }
        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};
