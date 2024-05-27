import { useContext } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { RoundState } from "../../game-base/type";
import { Menu } from "./menu";
import styles from "./settings.module.scss";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../_shared/helpers";
import { usePFDispatch } from "../../../_shared/react-contexts/game-state-context/pf/pf-context";
import { PFEventActionType } from "../../../_shared/react-contexts/game-state-context/pf/pf-action";

const ButtonSettingClassName = "setting-button";

export function Settings() {
    const { roundState } = useGameStateContext();
    const pfDispatch = usePFDispatch();
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);

    const handleClickPFSetting = () => {
        if (roundState === RoundState.Disabled) {
            return;
        }

        clickSound();
        pfDispatch({
            type: PFEventActionType.TOGGLE_PF_SETTING,
            payload: {
                isShowPFSetting: true,
            },
        });

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.PFSetting,
            action: TrackingAction.Open,
        });
    };

    const handleBackToLobbyOnclick = () => {
        clickSound();
        updateURLContext({ gameId: 0 });
        backToRedirectUrl(redirectUrl);
    };

    return (
        <div className={styles["settings-container"]}>
            <div className={styles["setting-right"]}>
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
