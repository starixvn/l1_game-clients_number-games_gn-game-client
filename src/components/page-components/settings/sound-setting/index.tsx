import React, { useState } from "react";

import { AnalyticsHelper, localStorageKeys, StorageHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { useClickSound, useTranslator } from "../../../../_shared/react-hooks";
import Styles from "../settings.module.scss";
import * as Sentry from "@sentry/nextjs";

const SoundSetting = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? true);
    const clickSound = useClickSound();
    const { t } = useTranslator();

    const toggle = () => {
        const updateSoundSetting = !enabledSound;
        clickSound();
        setEnabledSound(updateSoundSetting);
        StorageHelper.set(localStorageKeys.enableSound, updateSoundSetting);
        Sentry.captureMessage(`SoundSetting updateSoundSetting: ${updateSoundSetting}`);

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.Sound,
            action: updateSoundSetting ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
        });
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
