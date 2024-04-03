import React, { useState } from "react";

import { localStorageKeys, StorageHelper } from "../../../../_shared/helpers";
import { useClickSound, useTranslator } from "../../../../_shared/react-hooks";
import Styles from "../settings.module.scss";

const SoundSetting = ({}) => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? true);
    const clickSound = useClickSound();
    const { t } = useTranslator();

    const toggle = () => {
        clickSound();
        setEnabledSound(!enabledSound);
        StorageHelper.set(localStorageKeys.enableSound, !enabledSound);
    };

    return (
        <div className={`${Styles["row"]} `}>
            <label className={`${Styles["text"]} `}>{t("lobby_sound_effect")}</label>
            <span className={`${Styles["icon"]} ${Styles["switch"]}`}>
                <input id="switch-sound" type="checkbox" checked={enabledSound} onChange={toggle} />
                <label htmlFor="switch-sound"></label>
            </span>
        </div>
    );
};

export default SoundSetting;
