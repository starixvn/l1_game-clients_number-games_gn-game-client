import {
    PFClientSeedSetting,
    PFResult,
} from "../../../../components/game-base/type";
import { localStorageKeys, StorageHelper } from "../../../helpers";

export interface PFContextModel {
    isShowPFSetting: boolean;
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    pfVerifyModalData?: PFResult;
    ownBets?: any;
    gameId: number;
    uid: number;
}

export const initialPFContextModel = ({ gameId, uid }) => {
    const defaultContext = {
        isShowPFSetting: false,
        isShowPFVerify: false,
        isShowPFClientSeedInfo: false,
        isShowPFVerification: false,
        pfVerifyModalData: null,
        ownBets: {},
        gameId,
        uid,
        pfClientSeedSetting: {
            drawId: 0,
            randomClientSeed: "0000",
            manualClientSeed: "",
            useManualClientSeed: false,
        },
    } as PFContextModel;

    try {
        const isShowPFSetting = StorageHelper.get<string>(`${localStorageKeys.showPFSetting}`) === `${uid}-${gameId}`;
        !isShowPFSetting && StorageHelper.set(`${localStorageKeys.showPFSetting}`, '');

        return { ...defaultContext, ...{ isShowPFSetting } };
    } catch (error) {
        return defaultContext;
    }
};
