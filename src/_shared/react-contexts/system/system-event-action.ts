import { SystemContextModel } from "./system-context-model";

export enum SystemEventActionType {
    SELECT_CHIP = "SELECT_CHIP",
    SET_USER_GESTURE = "SET_USER_GESTURE",
}

export interface SystemEventAction {
    type: SystemEventActionType;
    payload?: SystemContextModel;
}
