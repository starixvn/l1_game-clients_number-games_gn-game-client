import { SettingContextModel } from "./setting-context-model";

export enum SettingEventActionType {
    TOGGLE_SETTING = "TOGGLE_SETTING",
    TOGGLE_MUSIC = "TOGGLE_MUSIC",
    SHOW_AVATAR_GALLERY = "SHOW_AVATAR_GALLERY",
    UPDATE_CHIPS = "UPDATE_CHIPS",
    UPDATE_VOLUME_MUSIC = "UPDATE_VOLUME_MUSIC",
    UPDATE_VOLUME_SFX = "UPDATE_VOLUME_SFX",
    SET_USER_GESTURE = "SET_USER_GESTURE",
}

export interface SettingEventAction {
    type: SettingEventActionType;
    payload?: SettingContextModel;
}
