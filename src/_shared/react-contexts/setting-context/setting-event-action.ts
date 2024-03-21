import { SettingContextModel } from "./setting-context-model";

export enum SettingEventActionType {
    TOGGLE_SETTING = "TOGGLE_SETTING",
}

export interface SettingEventAction {
    type: SettingEventActionType;
    payload?: SettingContextModel;
}
