import { SystemContextModel } from "./system-context-model";

export enum SystemEventActionType {
    SELECT_CHIP = "SELECT_CHIP",
}

export interface SystemEventAction {
    type: SystemEventActionType;
    payload?: SystemContextModel;
}
