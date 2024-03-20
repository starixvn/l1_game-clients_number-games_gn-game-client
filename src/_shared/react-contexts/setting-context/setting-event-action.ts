import { SettingContextModel } from "./setting-context-model";

export enum SetingEventActionType {
    TOGGLE_SETTING = "TOGGLE_SETTING",
}

export interface SettingEventAction {
    type: SetingEventActionType;
    payload?: SettingContextModel;
}
