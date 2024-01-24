import { useTranslation } from "next-i18next";
import React, { useRef, useMemo } from "react";
import { isMobileOnly } from "react-device-detect";
import { getLogoName } from "../../header";
import { Tooltip } from "../tooltip";
import styles from "./settings.module.scss";
import { Props } from "./types";

const ButtonSettingClassName = "setting-button";

export const Settings: React.FC<Props> = ({ onToggleSound, enabledSound, toggleGuideModal }) => {
    const { t } = useTranslation();
    const toggleSoundBtnRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";

    const handleBackToHome = () => {
        console.log("Back to Home");
    };

    return useMemo(() => {
        return (
            <div className={styles["settings-container"]}>
                <div className={`${styles["setting-right"]} ${styles[getLogoName()]}`}>
                    <div
                        ref={toggleSoundBtnRef}
                        id="sound-settings"
                        className={`${styles[ButtonSettingClassName]} ${styles[specialClassByDevice]}`}
                        onClick={() => onToggleSound()}
                    >
                        <span
                            className={
                                enabledSound ? `icon-sound-on ${styles["icon-sound-on"]}` : `icon-sound-off ${styles["icon-sound-off"]}`
                            }
                        ></span>

                        <Tooltip message={`${t("sound")}: ${enabledSound ? t("on") : t("off")}`} hoverWrapper={toggleSoundBtnRef} />
                    </div>

                    <button className={styles[ButtonSettingClassName]} onClick={() => toggleGuideModal()}>
                        <span className="icon-guide"></span>
                    </button>

                    <button className={styles[ButtonSettingClassName]} onClick={handleBackToHome}>
                        <span className="icon-home"></span>
                    </button>
                </div>
            </div>
        );
    }, [enabledSound]);
};
