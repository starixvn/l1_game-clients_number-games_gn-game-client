import React from "react";
import { getLogoName } from "../../page-components/header";
import styles from "./settings.module.scss";
import { Menu } from "./menu";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

const ButtonSettingClassName = "setting-button";

export const Settings: React.FC = () => {
    const dispatch = useGameStatesDispatch();

    const handleBackToHome = () => {
        console.log("Back to Home");
    };
    const handleClickPFSetting = () => {
        dispatch({
            type: GameEventActionType.TOGGLE_PF_SETTING,
            payload: {
                isShowPFSetting: true,
            },
        });
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

                <Menu />
            </div>
        </div>
    );
};
