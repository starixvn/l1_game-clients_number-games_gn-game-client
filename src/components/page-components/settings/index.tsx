import Styles from "./settings.module.scss";
import { useSettingContext, useSettingDispatch, SettingEventActionType } from "../../../_shared/react-contexts";
import React, { useRef, useEffect, useState } from "react";
import MusicSetting from "./music-setting";
import SoundSetting from "./sound-setting";

const Settings = ({}) => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();

    const closePopup = () => {
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: false,
            },
        });
    };

    const wrapperRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                closePopup();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className={`${Styles["settings"]} ${Styles[settingContext.isShowedSetting ? "" : "hide-settings"]} `}>
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
    );
};

export default Settings;
