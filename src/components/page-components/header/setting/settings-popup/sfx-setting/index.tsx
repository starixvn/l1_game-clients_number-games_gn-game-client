import { useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../../../_shared/react-hooks";
import Styles from "../settings-popup.module.scss";
import VolumeSetting from "../volume-setting";

const SoundSetting = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get<boolean>(localStorageKeys.enableSound) ?? true);
    const clickSound = useClickSound();

    const { t } = useTranslator();
    const volumeSFX = StorageHelper.get<number>(localStorageKeys.volumeSFX) ?? 50;

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
            type: SettingEventActionType.UPDATE_VOLUME_SFX,
            payload: {
                volumeSFX: value,
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
                    <button className={`${Styles["button"]}`} onClick={toggle}>
                        <span className={`icon-sound-${enabledSound ? "on" : "off"}`}></span>
                    </button>
                </div>
                <VolumeSetting onChangeVolume={onChangeVolume} defaultValue={volumeSFX} />
            </div>
        </div>
    );
};

export default SoundSetting;
