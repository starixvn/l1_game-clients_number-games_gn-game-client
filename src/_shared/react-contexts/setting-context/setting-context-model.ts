import { StorageHelper, localStorageKeys } from "../../helpers";

export interface SettingContextModel {
    isShowedSetting: boolean;
    enabledMusic: boolean;
    isShowAvatarGallery: boolean;
    avatarId: number;
}

export const initialSettingContextModel = (): SettingContextModel => {
    return {
        isShowedSetting: false,
        enabledMusic: StorageHelper.get(localStorageKeys.enableMusic) ?? false,
        isShowAvatarGallery: false,
        avatarId: 0,
    };
};
