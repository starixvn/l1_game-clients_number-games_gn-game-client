import React from "react";
import { isMobileOnly } from "react-device-detect";

import { buildVersion } from "./../../../../_shared/constants";
import Styles from "./container.module.scss";

const FirstLoginContainer: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const logo = `/vercel.svg?v=${buildVersion}`;

    return (
        <div className={`${Styles["wrapper"]} ${Styles["first-login"]} ${isMobileOnly ? Styles["mobile"] : ""}`}>
            <div className={Styles["page-bg"]}>
                <div className={Styles["page-container"]}>{children}</div>
            </div>
        </div>
    );
};

export default FirstLoginContainer;
