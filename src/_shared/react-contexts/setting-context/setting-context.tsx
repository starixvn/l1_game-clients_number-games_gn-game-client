import { createContext, useContext, useReducer } from "react";

import { SettingContextModel, initialSettingContextModel } from "./setting-context-model";
import { SettingEventAction, SettingEventActionType } from "./setting-event-action";

export const SettingContext = createContext<Partial<SettingContextModel>>({});
export const SettingDispatchContext = createContext(null);

SettingContext.displayName = "SettingContext";

export const SettingContextProvider = ({ children }) => {
    const [settingContextModel, dispatch] = useReducer(settingReducer, initialSettingContextModel());
    return (
        <SettingContext.Provider value={settingContextModel}>
            <SettingDispatchContext.Provider value={dispatch}>{children}</SettingDispatchContext.Provider>
        </SettingContext.Provider>
    );
};

export const useSettingContext = () => useContext(SettingContext);
export const useSettingDispatch = () => useContext(SettingDispatchContext);

const settingReducer = (state: any, action: SettingEventAction) => {
    const { type, payload } = action;
    const { isShowedSetting } = payload;

    switch (type) {
        case SettingEventActionType.TOGGLE_SETTING: {
            return {
                ...state,
                isShowedSetting,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};
