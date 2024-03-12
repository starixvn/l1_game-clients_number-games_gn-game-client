import React from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { getLogoName } from "../../page-components/header";
import { Menu } from "./menu";
import styles from "./settings.module.scss";

const ButtonSettingClassName = "setting-button";

export const Settings: React.FC = () => {
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();

    const handleBackToHome = () => {
        clickSound();
        console.log("Back to Home");
    };
    const handleClickPFSetting = () => {
        clickSound();
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
