import { SettingContextModel } from "./setting-context-model";

export enum SettingEventActionType {
    TOGGLE_SETTING = "TOGGLE_SETTING",
    TOGGLE_MUSIC = "TOGGLE_MUSIC",
}

export interface SettingEventAction {
    type: SettingEventActionType;
    payload?: SettingContextModel;
}
