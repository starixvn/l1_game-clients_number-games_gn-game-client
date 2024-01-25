import React from "react";
import { isMobileOnly } from "react-device-detect";
import { buildVersion, isL1System } from "../../../common/constants";
import Styles from "./container.module.scss";

const FirstLoginContainer: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const logoTheme = "";

    return (
        <div className={`${Styles["wrapper"]} ${isMobileOnly ? Styles["mobile"] : ""}`}>
            <div className={Styles["page-bg"]}>
                <div className={Styles["page-container"]}>
                    <div className={Styles["logo"]}>
                        <img
                            src={`/static/images/${logoTheme}.svg?v=${buildVersion}`}
                            className={`img-fluid`}
                            alt="logo"
                        />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FirstLoginContainer;
