import Styles from "../settings.module.scss";
import React, { useState, useEffect } from "react";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import MusicPlayer from "../../music-player";

const MusicSetting = ({}) => {
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? false);
    const toggle = () => {
        console.log("toggle background music");
        setEnabledMusic(!enabledMusic);
        StorageHelper.set(localStorageKeys.enableMusic, !enabledMusic);
    };

    const getIconClass = (isOn: boolean) => {
        return isOn ? "icon-on" : "icon-off";
    };

    return (
        <MusicPlayer enabledMusic={enabledMusic}>
            <div className={`${Styles["row"]} `}>
                <span className={`${Styles["text"]} `}>Background music</span>
                <span className={`${Styles["icon"]}`} onClick={toggle}>
                    <span className={`${Styles[getIconClass(enabledMusic)]}`}>&nbsp;</span>
                </span>
            </div>
        </MusicPlayer>
    );
};

export default MusicSetting;
