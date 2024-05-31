import { ChipInfo } from "sc-user-service-client/dist/setting";
import { StorageHelper, localStorageKeys } from "../../helpers";

export interface SettingContextModel {
    isShowedSetting: boolean;
    enabledMusic: boolean;
    isShowAvatarGallery: boolean;
    chipSettings: ChipInfo[];
}

export const initialSettingContextModel = (): SettingContextModel => {
    return {
        isShowedSetting: false,
        enabledMusic: StorageHelper.get<boolean>(localStorageKeys.enableMusic) ?? true,
        isShowAvatarGallery: false,
        chipSettings: [],
    };
};
