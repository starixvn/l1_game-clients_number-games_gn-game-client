import { createContext, useContext, useReducer } from "react";

import { SystemContextModel, initialSystemContextModel } from "./system-context-model";
import { SystemEventAction, SystemEventActionType } from "./system-event-action";

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
    const { selectedChip,  isEnableQuickBet } = payload;

    switch (type) {
        case SystemEventActionType.SELECT_CHIP: {
            return {
                ...state,
                selectedChip,
            };
        }

        case SystemEventActionType.SET_QUICK_BET: {
            return {
                ...state,
                isEnableQuickBet,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};
