import {
    PFClientSeedSetting,
    PFResult,
} from "../../../../components/game-base/type";

export interface PFContextModel {
    isShowPFSetting: boolean;
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    pfVerifyModalData?: PFResult;
}

export const initialPFContextModel = () => {
    return {
        pfClientSeedSetting: {
            drawId: 0,
            randomClientSeed: "0000",
            manualClientSeed: "",
            useManualClientSeed: false,
        },
    };
};
