import { StorageHelper, localStorageKeys } from "../../helpers";

export interface SettingContextModel {
    isShowedSetting: boolean;
    enabledMusic: boolean;
}

export const initialSettingContextModel = (): SettingContextModel => {
    return {
        isShowedSetting: false,
        enabledMusic: StorageHelper.get(localStorageKeys.enableMusic) ?? false,
    };
};
