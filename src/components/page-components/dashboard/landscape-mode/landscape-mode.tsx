import React from "react";

import Styles from "./landscape-mode.module.scss";
import { useCommonTranslate } from "../../../../_shared/react-hooks";

export const LandscapeMode = () => {
    const { t } = useCommonTranslate();
    return (
        <div className={Styles["landscape-mode"]} data-testid="landscape-mode-component">
            <img src="/static/images/landscape-icon.svg" alt="landscape-icon" />
            <p className={Styles["info"]}>{t("message_rotate_device")}</p>
        </div>
    );
};
