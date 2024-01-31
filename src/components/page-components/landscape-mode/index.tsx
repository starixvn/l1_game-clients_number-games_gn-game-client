import { useTranslation } from "next-i18next";
import React from "react";

import Styles from "./landscape-mode.module.scss";

const LandscapeMode = () => {
    const { t } = useTranslation("common");

    return (
        <div className={Styles["landscape-mode"]} data-testid="landscape-mode-component">
            <img src="/static/images/landscape-icon.svg" alt="landscape-icon" />
            <p className={Styles["info"]}>{t("common:rotateDevice")}</p>
        </div>
    );
};

export default LandscapeMode;
