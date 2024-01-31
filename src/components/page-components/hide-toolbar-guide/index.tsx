import React, { useEffect, useMemo, useState } from "react";
import Styles from "./hide-toolbar-guide.module.scss";
import { buildVersion, LanguageLocaleMapper } from "../../../_shared/constants";
import { i18n, useTranslation } from "next-i18next";
import { isMobileOnly } from "react-device-detect";
import { localStorageKeys, storeLocalStorageItem } from "../../../_shared/local-storage";
import { getLogoName } from "../header";

export const ToolbarGuide: React.FC<{isShowToolbarGuide: boolean, onCloseGuide:Function}> = ({isShowToolbarGuide, onCloseGuide}) => {
    const { t } = useTranslation();    
    const [isAnimClass, setIsAnimClass] = useState(true);  
    const animIntervalTime = 6;    

    useEffect(() => {       
        const playAnimInterval = setInterval(() => {     
            isAnimClass ? setIsAnimClass(false) : setIsAnimClass(true);
        }, animIntervalTime * 1000);        

        return () => {
            playAnimInterval && clearInterval(playAnimInterval)
        };
    }, [isAnimClass]);

    useEffect(() => {    
        if (isShowToolbarGuide) {
            document.body.classList.add("no-scroll");
            isMobileOnly && document.documentElement.classList.add("no-scroll-html");
        }

        return () => {
            if (isShowToolbarGuide) {
                document.body.classList.remove("no-scroll");
                isMobileOnly && document.documentElement.classList.remove("no-scroll-html");
            }
        };
    }, [isShowToolbarGuide]);    

    const handleTurnOffGuide = () => {
        onCloseGuide();             
        storeLocalStorageItem(localStorageKeys.toolbarGuide, false)
    };

    const closeGuide = () => {
        onCloseGuide()    
    };

    const animClass = isAnimClass ? "has-anim" : "";
    
    return useMemo(() => {            
        return (
            isShowToolbarGuide && (<div className={`${Styles["hide-guide-container"]} ${Styles[animClass]}`}>
            <div className={Styles["intro"]}>
                <div className={Styles["text-white"]}>{t("common:guide-intro-1")}</div>
                <div className={Styles["text-orange"]}>{t("common:guide-intro-2")}</div>
                <div className={Styles["text-white"]}>{t("common:guide-intro-3")} <strong>&#34;{t("common:guide-intro-4")}&#34;</strong></div>
            </div>
            <div className={Styles["anim-container"]}>
                <img
                className={Styles["iphone-background"]}
                alt="iphone"
                src={`/static/images/hide-toolbar-guide/ip_base.png?v=${buildVersion}`}
                />
                <div className={Styles["top-phone"]}>
                    <span className={Styles["phone-time"]}>09:41</span>
                    <div className={Styles["top-phone-icon"]}>
                        <span className={Styles["icon-cellular"]}></span>
                        <span className={Styles["icon-wifi"]}></span>
                        <span className={Styles["icon-battery"]}></span>
                    </div>
                    <div className={Styles["pulsating-circle"]}></div>
                </div>
                <div className={Styles["toolbar"]}>
                    <span className={Styles["icon-aa"]}></span>
                    <span className={Styles["text"]}>hide-toolbar.com</span>
                    <span className={Styles["icon-refresh"]}></span>
                </div>
                <img
                    className={Styles["UI-game-image"]}
                    alt="iphone"
                    width={227}
                    src={`/static/images/hide-toolbar-guide/UI-game-${getLogoName()}_${LanguageLocaleMapper[i18n.language]}.png?v=${buildVersion}`}
                />
                <div className={Styles["dropdown-settings"]}>
                    <img
                        className={Styles["popup"]}
                        alt="iphone"
                        src={`/static/images/hide-toolbar-guide/popup_${LanguageLocaleMapper[i18n.language]}.png?v=${buildVersion}`}
                    />
                    <div className={Styles["border-highlight"]}></div>
                    <div className={Styles["pulsating-circle"]}></div>
                </div>   
                <div className={Styles["mask-game-UI"]}></div>            
            </div>
             <div className={Styles["button-action"]}>
                <button className={`btn-grey ${Styles["btn"]}`} onClick={closeGuide}>
                    {t("common:close")}
                </button>
                <button className={`btn-red ${Styles["btn"]}`} onClick={handleTurnOffGuide}>
                    {t("common:do-not-show-again")}
                </button>
            </div>
        </div>)            
        );
    },[isShowToolbarGuide, isAnimClass]
)};
