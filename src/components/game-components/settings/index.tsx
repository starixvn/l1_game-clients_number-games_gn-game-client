import React, { useMemo } from "react";
import { getLogoName } from "../../page-components/header";
import styles from "./settings.module.scss";
import { Props } from "./types";
import { Menu } from "./menu";

const ButtonSettingClassName = "setting-button";

export const Settings: React.FC<Props> = ({ onToggleSound, enabledSound, toggleGuideModal }) => {
    const handleBackToHome = () => {
        console.log("Back to Home");
    };

    return useMemo(() => {
        return (
            <div className={styles["settings-container"]}>
                <div className={`${styles["setting-right"]} ${styles[getLogoName()]}`}>
                    <button className={styles[ButtonSettingClassName]} onClick={handleBackToHome}>
                        <span className="icon-home" />
                    </button>

                    <Menu handleToggleGuideModal={toggleGuideModal} enabledSound={enabledSound} onToggleSound={onToggleSound} />
                </div>
            </div>
        );
    }, [enabledSound]);
};
