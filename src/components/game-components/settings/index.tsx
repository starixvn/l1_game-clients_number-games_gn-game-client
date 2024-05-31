import { useContext } from "react";
import { URLContext, updateURLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { Menu } from "./menu";
import styles from "./settings.module.scss";

const ButtonSettingClassName = "setting-button";

export function Settings() {
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);

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

                <Menu />
            </div>
        </div>
    );
}
