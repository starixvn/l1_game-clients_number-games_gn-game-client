import { ChipInfo } from "sc-user-service-client/dist/setting";
import { StorageHelper, localStorageKeys } from "../../helpers";

export interface SettingContextModel {
    isShowedSetting: boolean;
    enabledMusic: boolean;
    isShowAvatarGallery: boolean;
    chipSettings: ChipInfo[];
    volumeMusic: number;
    volumeSFX: number;
    isUserGesture: boolean;
}

export const initialSettingContextModel = (): SettingContextModel => {
    return {
        isShowedSetting: false,
        enabledMusic: StorageHelper.get<boolean>(localStorageKeys.enableMusic) ?? true,
        isShowAvatarGallery: false,
        chipSettings: [],
        volumeMusic: StorageHelper.get<number>(localStorageKeys.volumeMusic) ?? 50,
        volumeSFX: StorageHelper.get<number>(localStorageKeys.volumeSFX) ?? 50,
        isUserGesture: false,
    };
};
