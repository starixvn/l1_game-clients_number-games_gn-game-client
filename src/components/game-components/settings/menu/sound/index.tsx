import React, { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../../../_shared/helpers";
import Styles from "./../menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Sound: React.FC = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? true);

    const onToggleSound = () => {
        StorageHelper.set(localStorageKeys.enableSound, !enabledSound);
        setEnabledSound(!enabledSound);
    };

    return (
        <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} id="sound-settings" onClick={() => onToggleSound()}>
            <span
                id={enabledSound ? `icon-sound-on` : `icon-sound-off`}
                className={enabledSound ? `icon-sound-on ${Styles["menu-icon"]}` : `icon-sound-off ${Styles["menu-icon"]}`}
            ></span>
        </div>
    );
};
