import React, { useState } from "react";

import { localStorageKeys, StorageHelper } from "../../../../_shared/helpers";
import { SettingEventActionType, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import Styles from "../settings.module.scss";

const MusicSetting = ({}) => {
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? true);
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
            <label className={`${Styles["text"]} `}>Background music</label>
            <span className={`${Styles["icon"]} ${Styles["switch"]}`}>
                <input id="switch-music" type="checkbox" checked={enabledMusic} onChange={toggle} />
                <label htmlFor="switch-music"></label>
            </span>
        </div>
    );
};

export default MusicSetting;
