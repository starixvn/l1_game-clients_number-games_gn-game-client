import Styles from "../settings.module.scss";
import React, { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";

const SoundSetting = ({}) => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? false);

    const toggle = () => {
        console.log("toggle sound");
        setEnabledSound(!enabledSound);
        StorageHelper.set(localStorageKeys.enableSound, !enabledSound);
    };

    const getIconClass = (isOn: boolean) => {
        return isOn ? "icon-on" : "icon-off";
    };

    return (
        <div className={`${Styles["row"]} `}>
            <span className={`${Styles["text"]} `}>Sound Effect</span>
            <span className={`${Styles["icon"]}`} onClick={toggle}>
                <span className={`${Styles[getIconClass(enabledSound)]}`}>&nbsp;</span>
            </span>
        </div>
    );
};

export default SoundSetting;
