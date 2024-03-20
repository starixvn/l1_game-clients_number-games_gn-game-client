export interface SettingContextModel {
    isShowedSetting: boolean;
}

export const initialSettingContextModel = (): SettingContextModel => {
    return {
        isShowedSetting: false,
    };
};
