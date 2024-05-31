import { useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../_shared/react-hooks";
import VolumeSetting from "../../header/settings-icon/settings-popup/volume-setting";
import Styles from "../settings.module.scss";

const SoundSetting = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? true);
    const clickSound = useClickSound();
    const { t } = useTranslator();

    const volumeSFX = StorageHelper.get(localStorageKeys.volumeSFX) ?? 50;
    const settingDispatch = useSettingDispatch();
    const toggle = () => {
        clickSound();
        toggleValue();
        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Sound,
            action: !enabledSound ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
    };

    const onChangeVolume = (value) => {
        StorageHelper.set(localStorageKeys.volumeSFX, value);

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
            <label className={`${Styles["text"]} `}>{t("lobby_sound_effect")}</label>
            <div className="setting-item-container">
                <span className={`${Styles["icon"]} ${Styles["switch"]}`}>
                    <input id="switch-sound" type="checkbox" checked={enabledSound} onChange={toggle} />
                    <label htmlFor="switch-sound"></label>
                </span>
                <VolumeSetting onChangeVolume={onChangeVolume} defaultValue={volumeSFX} />
            </div>
        </div>
    );
};

export default SoundSetting;
