import React, { useContext } from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { getLogoName } from "../../page-components/header";
import { Menu } from "./menu";
import styles from "./settings.module.scss";
import { URLContext } from "../../../_shared/react-contexts/url-context";

const ButtonSettingClassName = "setting-button";

export function Settings() {
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);

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

                {(!isDirectMode || redirectUrl !== "") && <button className={styles[ButtonSettingClassName]} onClick={() => backToRedirectUrl(redirectUrl)}>
                    <span id="icon-home" className="icon-home" />
                </button>}

                <Menu />
            </div>
        </div>
    );
};
