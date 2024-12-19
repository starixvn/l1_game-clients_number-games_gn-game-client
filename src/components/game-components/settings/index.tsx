import { Menu } from "./menu";
import styles from "./settings.module.scss";

const ButtonSettingClassName = "setting-button";

export function Settings() {
    return (
        <div className={styles["settings-container"]}>
            <Menu />
        </div>
    );
}
