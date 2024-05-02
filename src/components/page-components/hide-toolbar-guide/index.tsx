import React, { useEffect, useMemo, useState } from "react";
import { isMobileOnly, isSafari } from "react-device-detect";

import { buildVersion } from "../../../_shared/constants";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useClickSound } from "../../../_shared/react-hooks/use-sound";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import Styles from "./hide-toolbar-guide.module.scss";

const HIDE_TOOLBAR_GUIDE_PATH = "./static/images/hide-toolbar-guide";

const ToolbarIcon = ({ name }) => {
    return <img src={`${HIDE_TOOLBAR_GUIDE_PATH}/${name}.svg?v=${buildVersion}`} alt={name} />;
};

const ToolbarGuide: React.FC = () => {
    const { t } = useTranslator();
    const { session } = usePlayerContext();
    const clickSound = useClickSound();

    const [isAnimClass, setIsAnimClass] = useState(true);
    const [isEnabledToolbarGuide, setIsEnabledToolbarGuide] = useState(false);

    const animIntervalTime = 4;
    const iconAA = <ToolbarIcon name="iconAA" />;
    const iconFullScreen = <ToolbarIcon name="icon-fullscreen" />;
    const iconPointer = <ToolbarIcon name="pointer" />;
    const animClass = isAnimClass ? "has-anim" : "";
    const fixedUIHeight = 713;

    useEffect(() => {
        const isStorageHideGuide = StorageHelper.get(localStorageKeys.hideToolbarGuide) ?? false;
        const currentSessionHideToolbarGuide = StorageHelper.get(localStorageKeys.currentSessionHideToolbarGuide) ?? "";

        if (isStorageHideGuide) {
            return;
        }

        if (currentSessionHideToolbarGuide !== session?.ss && window.innerHeight < fixedUIHeight) {
            setIsEnabledToolbarGuide(true);
        }
    }, []);

    useEffect(() => {
        const playAnimInterval = setInterval(() => {
            isAnimClass ? setIsAnimClass(false) : setIsAnimClass(true);
        }, animIntervalTime * 1000);

        return () => {
            playAnimInterval && clearInterval(playAnimInterval);
        };
    }, [isAnimClass]);

    useEffect(() => {
        if (isEnabledToolbarGuide) {
            document.body.classList.add("no-scroll");
            isMobileOnly && document.documentElement.classList.add("no-scroll-html");
        }

        return () => {
            if (isEnabledToolbarGuide && isSafari) {
                document.body.classList.remove("no-scroll");
                isMobileOnly && document.documentElement.classList.remove("no-scroll-html");
            }
        };
    }, [isEnabledToolbarGuide]);

    const handleDoNotShowAgain = () => {
        clickSound();
        handleClose();
        StorageHelper.set(localStorageKeys.hideToolbarGuide, true);
    };

    const handleClose = () => {
        clickSound();
        setIsEnabledToolbarGuide(false);
        StorageHelper.set(localStorageKeys.currentSessionHideToolbarGuide, session?.ss);
    };

    return useMemo(() => {
        return (
            isEnabledToolbarGuide && (
                <div className={`${Styles["toolbar-guide-container"]} ${Styles[animClass]}`}>
                    <div className={Styles["toolbar-guide-content"]}>
                        <div className={Styles["toolbar-guide-title"]}>{t(`${ResourceTypes.SABA_NUMBER}.lobby_fullscreen`)}</div>
                        <div className={Styles["anim-container"]}>
                            <div className="flex justify-center">
                                <img
                                    className={Styles["iphone-background"]}
                                    alt="iphone"
                                    src={`/static/images/hide-toolbar-guide/mockup-phone.svg?${buildVersion}`}
                                />
                            </div>
                            <div className={`flex ${Styles["iphone-step"]}`}>
                                <span className={Styles["step-number"]}>1</span>
                                <p className={Styles["step-text"]}>
                                    <span className={Styles["text-icon-aa"]}>
                                        {t(`${ResourceTypes.SABA_NUMBER}.fullscreen_guide_1`, { icon: iconAA })}
                                    </span>
                                </p>
                                <span className={Styles["step-number"]}>2</span>
                                <p className={Styles["step-text"]}>{t(`${ResourceTypes.SABA_NUMBER}.fullscreen_guide_2`)}</p>
                            </div>
                            <div className={Styles["hide-toolbar"]}>
                                <span>{t(`${ResourceTypes.SABA_NUMBER}.fullscreen_guide_3`)}</span>
                                <span className={Styles["icon-fullscreen"]}>{iconFullScreen}</span>
                            </div>
                            <div className={Styles["toolbar-container"]}>
                                <div className={Styles["toolbar"]}>
                                    <span className={Styles["icon-aa"]}>{iconAA}</span>
                                </div>
                                <div className={Styles["bottom-gestures"]}></div>
                            </div>
                            <span className={Styles["icon-pointer"]}>{iconPointer}</span>
                        </div>
                        <div className={Styles["button-group"]}>
                            <button className="btn-grey" onClick={handleClose}>
                                {t(`${ResourceTypes.SABA_NUMBER}.button_close`)}
                            </button>
                            <button className="btn-orange" onClick={handleDoNotShowAgain}>
                                {t(`${ResourceTypes.SABA_NUMBER}.button_donot_show`)}
                            </button>
                        </div>
                    </div>
                </div>
            )
        );
    }, [isEnabledToolbarGuide, isAnimClass]);
};

export default ToolbarGuide;
