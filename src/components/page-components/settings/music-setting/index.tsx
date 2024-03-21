import Styles from "../settings.module.scss";
import React, { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { useSettingDispatch, SettingEventActionType } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";

const MusicSetting = ({}) => {
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? false);
    const toggle = () => {
        clickSound();
        setEnabledMusic(!enabledMusic);
        StorageHelper.set(localStorageKeys.enableMusic, !enabledMusic);
        settingDispatch({
            type: SettingEventActionType.TOGGLE_MUSIC,
            payload: {
                enabledMusic: !enabledMusic,
            },
        });
    };

    return (
        <div className={`${Styles["row"]} `}>
            <span className={`${Styles["text"]} `}>Background music</span>
            <span className={`${Styles["icon"]}`}>
                <span className={`${Styles[enabledMusic ? "icon-on" : "icon-off"]}`} onClick={toggle}>
                    &nbsp;
                </span>
            </span>
        </div>
    );
};

export default MusicSetting;
