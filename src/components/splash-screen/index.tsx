import React from "react";
import { buildVersion, locales, systemName } from "../../common/constants";
import Styles from "./splash-screen.module.scss";

export default function SplashScreen({ locale }) {
    return locale ? (
        <div className={`${Styles.page}`}>
            <img
                src={`/static/images/splash-screen/${locale}/logo-${systemName}.svg?${buildVersion}`}
                className={Styles["logo"]}
                width="274"
                height="96"
                alt="Logo"
            />
            {locale === locales.vi && (
                <img
                    src={`/static/images/splash-screen/${locale}/info.svg`}
                    className={Styles["info"]}
                    width="100"
                    height="26"
                    alt="Info"
                />
            )}
        </div>
    ) : (
        <></>
    );
}
