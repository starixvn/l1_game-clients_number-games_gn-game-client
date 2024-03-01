import { SystemContextModel } from "./system-context-model";

export enum SystemEventActionType {
    SELECT_CHIP = "SELECT_CHIP",
    ENABLE_SOUND = "ENABLE_SOUND",
}

export interface SystemEventAction {
    type: SystemEventActionType;
    payload?: SystemContextModel;
}
