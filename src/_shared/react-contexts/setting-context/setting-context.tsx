import { createContext, useContext, useReducer } from "react";

import { SettingContextModel, initialSettingContextModel } from "./setting-context-model";
import { SettingEventAction, SettingEventActionType } from "./setting-event-action";
import { StorageHelper, localStorageKeys } from "../../helpers";

export const SettingContext = createContext<Partial<SettingContextModel>>({});
export const SettingDispatchContext = createContext(null);

SettingContext.displayName = "SettingContext";

export const SettingContextProvider = ({ children }) => {
    const [settingContextModel, dispatch] = useReducer(settingReducer, initialSettingContextModel());
    settingContextModel.enabledMusic = StorageHelper.get(localStorageKeys.enableMusic) ?? true;
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
    const { isShowedSetting, enabledMusic, isShowAvatarGallery } = payload;

    switch (type) {
        case SettingEventActionType.TOGGLE_SETTING: {
            return {
                ...state,
                isShowedSetting,
            };
        }

        case SettingEventActionType.TOGGLE_MUSIC: {
            return {
                ...state,
                enabledMusic,
            };
        }

        case SettingEventActionType.SHOW_AVATAR_GALLERY: {
            return {
                ...state,
                isShowAvatarGallery,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
};
