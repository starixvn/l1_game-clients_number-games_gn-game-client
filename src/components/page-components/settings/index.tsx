import Styles from "./settings.module.scss";
import { useSettingContext, useSettingDispatch, SetingEventActionType } from "../../../_shared/react-contexts";
import React, { useRef, useEffect, useState } from "react";
import MusicSetting from "./music-setting";
import SoundSetting from "./sound-setting";

const Settings = ({}) => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    console.log("settingContext", settingContext);

    const closePopup = () => {
        console.log("close popup", settingContext.isShowedSetting);
        settingDispatch({
            type: SetingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: false,
            },
        });
    };

    const handleOutsideClick = (ref) => {
        // Temporary comment for build code
        //  useEffect(() => {
        //     function handleClickOutside(event) {
        //         if (ref.current && !ref.current.contains(event.target)) {
        //             closePopup();
        //         }
        //     }
        //     document.addEventListener("mousedown", handleClickOutside);
        //     return () => {
        //         // Unbind the event listener on clean up
        //         document.removeEventListener("mousedown", handleClickOutside);
        //     };
        // }, [ref]);
    };

    const wrapperRef = useRef(null);
    handleOutsideClick(wrapperRef);

    return (
        settingContext.isShowedSetting && (
            <div className={`${Styles["settings"]} `}>
                <div className={`${Styles["settings-popup"]} `} ref={wrapperRef}>
                    <div className={`${Styles["settings-header"]}`}>
                        <span className={`${Styles["text"]}`}>Setting</span>
                        <span className={`${Styles["icon"]}`} onClick={() => closePopup()}>
                            &nbsp;
                        </span>
                    </div>
                    <div className={`${Styles["settings-content"]} `}>
                        <div className={`${Styles["settings-sound"]} `}>
                            <MusicSetting />
                            <SoundSetting />
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default Settings;
