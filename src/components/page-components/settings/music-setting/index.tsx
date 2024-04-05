import React, { useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../../_shared/react-hooks";
import Styles from "../settings.module.scss";

const MusicSetting = ({}) => {
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? true);
    const { t } = useTranslator();

    const toggle = () => {
        const updateMusicSetting = !enabledMusic;
        clickSound();
        setEnabledMusic(updateMusicSetting);
        StorageHelper.set(localStorageKeys.enableMusic, updateMusicSetting);
        settingDispatch({
            type: SettingEventActionType.TOGGLE_MUSIC,
            payload: {
                enabledMusic: updateMusicSetting,
            },
        });
        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Music,
            action: updateMusicSetting ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
    };

    return (
        <div className={`${Styles["row"]} `}>
            <label className={`${Styles["text"]} `}>{t("lobby_background_music")}</label>
            <span className={`${Styles["icon"]} ${Styles["switch"]}`}>
                <input id="switch-music" type="checkbox" checked={enabledMusic} onChange={toggle} />
                <label htmlFor="switch-music"></label>
            </span>
        </div>
    );
};

export default MusicSetting;
