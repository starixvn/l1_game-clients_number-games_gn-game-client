import { useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useTranslator } from "../../../../_shared/react-hooks";
import VolumeSetting from "../../header/settings-icon/settings-popup/volume-setting";
import Styles from "../settings.module.scss";

const SoundSetting = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? true);

    const { t } = useTranslator();

    const volumeSFX = StorageHelper.get(localStorageKeys.volumeSFX) ?? 50;
    const settingDispatch = useSettingDispatch();

    const onChangeVolume = (value) => {
        StorageHelper.set(localStorageKeys.volumeSFX, value);

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Sound,
            action: !enabledSound ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });

        settingDispatch({
            type: SettingEventActionType.UPDATE_VOLUME_MUSIC,
            payload: {
                volumeMusic: value,
            },
        });

        if (!+value) {
            if (enabledSound) {
                toggleValue();
            }
        } else {
            if (!enabledSound) {
                toggleValue();
            }
        }
    };

    const toggleValue = () => {
        const updateSoundSetting = !enabledSound;
        setEnabledSound(updateSoundSetting);
        StorageHelper.set(localStorageKeys.enableSound, updateSoundSetting);
    };
    return (
        <div className={`${Styles["row"]} `}>
            <div className={Styles["text"]}>{t("lobby_sound_effect")}</div>
            <div className={Styles["setting-item-container"]}>
                <div className={`${Styles["icon"]} ${Styles["switch"]}`}>
                    <span className={`icon-sound-${enabledSound ? "on" : "off"}`}></span>
                </div>
                <VolumeSetting onChangeVolume={onChangeVolume} defaultValue={volumeSFX} />
            </div>
        </div>
    );
};

export default SoundSetting;
