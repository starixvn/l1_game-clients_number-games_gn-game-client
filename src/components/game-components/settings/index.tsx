import React from "react";
import { getLogoName } from "../../page-components/header";
import styles from "./settings.module.scss";
import { Props } from "./types";
import { Menu } from "./menu";

const ButtonSettingClassName = "setting-button";

export const Settings: React.FC<Props> = ({ toggleGuideModal, toggleHistoryModal, togglePFSettingModal }) => {
    const handleBackToHome = () => {
        console.log("Back to Home");
    };
    const handleClickPFSetting = () => {
        togglePFSettingModal();
    };

    return (
        <div className={styles["settings-container"]}>
            <div className={`${styles["setting-right"]} ${styles[getLogoName()]}`}>
                <button className={styles[ButtonSettingClassName]} onClick={handleClickPFSetting}>
                    <span id="icon-pf" className="icon-pf" />
                </button>

                <button className={styles[ButtonSettingClassName]} onClick={handleBackToHome}>
                    <span id="icon-home" className="icon-home" />
                </button>

                <Menu handleToggleGuideModal={toggleGuideModal} handleToggleBetHistory={toggleHistoryModal} />
            </div>
        </div>
    );
};
