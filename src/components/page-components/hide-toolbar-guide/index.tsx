import React, { useEffect, useMemo, useState } from "react";

import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import Styles from "./hide-toolbar-guide.module.scss";

const ToolbarGuide: React.FC<{
    isShowToolbar: boolean;
}> = ({ isShowToolbar }) => {
    const { t } = useTranslator();
    const [isAnimClass, setIsAnimClass] = useState(true);
    const animIntervalTime = 7;
    const iconAA = <img src="./static/images/hide-toolbar-guide/iconAA.svg" alt="icon-toolbar-guide" />;
    const iconFullScreen = <img src="./static/images/hide-toolbar-guide/icon-fullscreen.svg" alt="icon-toolbar-guide" />;
    const iconPointer = <img src="./static/images/hide-toolbar-guide/pointer.svg" alt="icon-toolbar-guide" />;

    useEffect(() => {
        const playAnimInterval = setInterval(() => {
            isAnimClass ? setIsAnimClass(false) : setIsAnimClass(true);
        }, animIntervalTime * 1000);

        return () => {
            playAnimInterval && clearInterval(playAnimInterval);
        };
    }, [isAnimClass]);

    const animClass = isAnimClass ? "has-anim" : "";

    return useMemo(() => {
        return (
            isShowToolbar && (
                <div className={`${Styles["toolbar-guide-container"]} ${Styles[animClass]}`}>
                    <div className={Styles["toolbar-guide-content"]}>
                        <div className={Styles["toolbar-guide-title"]}>{t(`${ResourceTypes.SABA_NUMBER}.lobby_fullscreen`)}</div>
                        <div className={Styles["anim-container"]}>
                            <div className="flex justify-center">
                                <img
                                    className={Styles["iphone-background"]}
                                    alt="iphone"
                                    src={`/static/images/hide-toolbar-guide/mockup-phone.svg`}
                                />
                            </div>
                            <div className={`flex ${Styles["iphone-step"]}`}>
                                <span className={Styles["step-number"]}>1</span>
                                <p className={Styles["step-text"]}>
                                    {t(`${ResourceTypes.SABA_NUMBER}.fullscreen_guide_1`, { icon: iconAA })}
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
                                    <span className={Styles["icon-pointer"]}>{iconPointer}</span>
                                </div>
                                <div className={Styles["bottom-gestures"]}></div>
                            </div>
                        </div>
                        <div className={Styles["button-group"]}>
                            <button
                                className="btn-grey"
                                onClick={() => {
                                    window.location.reload();
                                }}
                            >
                                {t(`${ResourceTypes.SABA_NUMBER}.button_close`)}
                            </button>
                            <button
                                className="btn-orange"
                                onClick={() => {
                                    window.location.reload();
                                }}
                            >
                                {t(`${ResourceTypes.SABA_NUMBER}.button_donot_show`)}
                            </button>
                        </div>
                    </div>
                </div>
            )
        );
    }, [isShowToolbar, isAnimClass]);
};

export default ToolbarGuide;
