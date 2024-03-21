import Styles from "../settings.module.scss";
import React, { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { useClickSound } from "../../../../_shared/react-hooks";

const SoundSetting = ({}) => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? false);
    const clickSound = useClickSound();

    const toggle = () => {
        clickSound();
        setEnabledSound(!enabledSound);
        StorageHelper.set(localStorageKeys.enableSound, !enabledSound);
    };

    return (
        <div className={`${Styles["row"]} `}>
            <span className={`${Styles["text"]} `}>Sound Effect</span>
            <span className={`${Styles["icon"]}`}>
                <span className={`${Styles[enabledSound ? "icon-on" : "icon-off"]}`} onClick={toggle}>
                    &nbsp;
                </span>
            </span>
        </div>
    );
};

export default SoundSetting;
