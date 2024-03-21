import Styles from "./settings.module.scss";
import { useSettingContext, useSettingDispatch, SettingEventActionType } from "../../../_shared/react-contexts";
import React, { useRef, useEffect, useState } from "react";
import MusicSetting from "./music-setting";
import SoundSetting from "./sound-setting";
import BaseDialog from "../../game-components/base-dialog";
import { ModalType } from "../../game-components/base-dialog/type";
import { useClickSound } from "../../../_shared/react-hooks";

const Settings = ({}) => {
    const settingContext = useSettingContext();
    const settingDispatch = useSettingDispatch();
    const clickSound = useClickSound();

    const closePopup = () => {
        clickSound();
        settingDispatch({
            type: SettingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: false,
            },
        });
    };

    return (
        settingContext.isShowedSetting && (
            <div className={`${Styles["settings"]}`}>
                <div className={`${Styles["settings-bg"]}`}></div>
                <BaseDialog type={ModalType.Center} isOpen={settingContext.isShowedSetting} onCloseModal={closePopup}>
                    <div className={`modal-center yellow-color ${Styles["settings-popup"]} `}>
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
                </BaseDialog>
            </div>
        )
    );
};

export default Settings;
