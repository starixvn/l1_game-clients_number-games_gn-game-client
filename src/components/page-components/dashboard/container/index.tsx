import React from "react";
import { isMobileOnly } from "react-device-detect";
import { buildVersion } from "./../../../../_shared/constants";
import Styles from "./container.module.scss";

const FirstLoginContainer: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const logo = `/vercel.svg?v=${buildVersion}`;

    return (
        <div className={`${Styles["wrapper"]} ${isMobileOnly ? Styles["mobile"] : ""}`}>
            <div className={Styles["page-bg"]}>
                <div className={Styles["page-container"]}>
                    <div className={Styles["logo"]}>
                        <img src={logo} className={`img-fluid`} alt="logo" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FirstLoginContainer;
