import { PFClientSeedSetting, PFResult } from "../../../../components/game-base/type";

export enum PFEventActionType {
    TOGGLE_PF_VERIFY = "TOGGLE_PF_VERIFY",
    UPDATE_PF_VERIFY = "UPDATE_PF_VERIFY",
    TOGGLE_PF_CLIENT_SEED_INFO = "TOGGLE_PF_CLIENT_SEED_INFO",
    TOGGLE_PF_VERIFICATION = "TOGGLE_PF_VERIFICATION",
    TOGGLE_PF_SETTING = "TOGGLE_PF_SETTING",
    UPDATE_PF_CLIENT_SEED_SETTING = "UPDATE_PF_CLIENT_SEED_SETTING",
}

export interface PFEventPayload {
    isShowPFSetting?: boolean;
    isShowPFVerify?: boolean;
    isShowPFClientSeedInfo?: boolean;
    isShowPFVerification?: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    pfVerifyModalData?: PFResult;
}

export interface PFEventAction {
    type: PFEventActionType;
    payload?: PFEventPayload;
}
