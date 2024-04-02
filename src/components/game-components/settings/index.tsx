import { useContext } from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { getLogoName } from "../../page-components/header";
import { Menu } from "./menu";
import styles from "./settings.module.scss";
import { RoundState } from "../../game-base/type";

const ButtonSettingClassName = "setting-button";

export function Settings() {
    const { roundState } = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);

    const handleClickPFSetting = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }

        clickSound();
        dispatch({
            type: GameEventActionType.TOGGLE_PF_SETTING,
            payload: {
                isShowPFSetting: true,
            },
        });
    };

    const handleBackToLobbyOnclick = () => {
        updateURLContext({ gameId: 0 });
        backToRedirectUrl(redirectUrl);
    };

    return (
        <div className={styles["settings-container"]}>
            <div className={`${styles["setting-right"]} ${styles[getLogoName()]}`}>
                {(!isDirectMode || redirectUrl) && (
                    <button className={styles[ButtonSettingClassName]} onClick={() => handleBackToLobbyOnclick()}>
                        <span id="icon-home" className="icon-home" />
                    </button>
                )}

                <button className={styles[ButtonSettingClassName]} onClick={handleClickPFSetting}>
                    <span id="icon-pf" className="icon-pf" />
                </button>

                <Menu />
            </div>
        </div>
    );
}
