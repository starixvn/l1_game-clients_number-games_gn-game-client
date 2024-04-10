import { SystemContextModel } from "./system-context-model";

export enum SystemEventActionType {
    SELECT_CHIP = "SELECT_CHIP",
    SET_QUICK_BET = "SET_QUICK_BET",
}

export interface SystemEventAction {
    type: SystemEventActionType;
    payload?: SystemContextModel;
}
