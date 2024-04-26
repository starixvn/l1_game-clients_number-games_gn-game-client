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
    ownBets?: any;
}

export const initialPFContextModel = () => {
    return {
        isShowPFSetting: false,
        isShowPFVerify:false,
        isShowPFClientSeedInfo: false,
        isShowPFVerification: false,
        pfVerifyModalData: null,
        pfClientSeedSetting: {
            drawId: 0,
            randomClientSeed: "0000",
            manualClientSeed: "",
            useManualClientSeed: false,
        },
    } as PFContextModel;
};
