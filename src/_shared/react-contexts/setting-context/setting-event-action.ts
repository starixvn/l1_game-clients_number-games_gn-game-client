import { SettingContextModel } from "./setting-context-model";

export enum SettingEventActionType {
    TOGGLE_SETTING = "TOGGLE_SETTING",
    TOGGLE_MUSIC = "TOGGLE_MUSIC",
    SHOW_AVATAR_GALLERY = "SHOW_AVATAR_GALLERY",
    CHANGE_AVATAR_ID = "CHANGE_AVATAR_ID",
}

export interface SettingEventAction {
    type: SettingEventActionType;
    payload?: SettingContextModel;
}
