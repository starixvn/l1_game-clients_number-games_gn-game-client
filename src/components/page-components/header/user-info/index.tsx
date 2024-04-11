import React, { useEffect, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { numberRoundDownWithCommas } from "../../../../_shared/helpers/number-helper";
import { SettingEventActionType, usePlayerContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import { MAX_AVATAR_ID } from "../../dashboard/register/avatar-gallery";
import Styles from "./user-info.module.scss";

export const UserInfo: React.FC<{
    customizeClass?: string;
    isLobby: boolean;
}> = ({ customizeClass, isLobby }) => {
    const clickSound = useClickSound();
    const [classCursor, setClassCursor] = useState<string>();
    const settingDispatch = useSettingDispatch();
    const { authorizeInfo } = usePlayerContext();
    const user = authorizeInfo.user;
    let deviceClass = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }

    const handleClickAvatar = () => {
        if (isLobby) {
            clickSound();
            settingDispatch({
                type: SettingEventActionType.SHOW_AVATAR_GALLERY,
                payload: {
                    isShowAvatarGallery: true,
                },
            });
        }
    };

    useEffect(() => {
        if (isLobby) {
            setClassCursor("user-cursor");
        } else {
            setClassCursor("");
        }
    }, [isLobby]);

    return (
        <div className={`${Styles["user"]} ${customizeClass ? Styles[customizeClass] : ""} ${deviceClass}`}>
            <div className={Styles["info"]}>
                <div id="user-info_user-name" className={Styles["user-name"]} data-testid="user-name">
                    {user.name}
                </div>
                <div key={user.red} className={`${Styles.balance}`} data-testid="balance">
                    <span id="user-info_balance" className={Styles["balance-text"]}>
                        {`${numberRoundDownWithCommas(user.red ? user.red : 0)} ${user.isDisplayPlayerCurrency ? user.currency : ""}`}
                    </span>

                    <img src="/static/images/icon-coin.svg" className="img-fluid" alt="icon-coin" />
                </div>
            </div>
            <div className={`${Styles["avatar"]} ${Styles[classCursor]}`} onClick={handleClickAvatar}>
                {user.avatarId > 0 && user.avatarId <= MAX_AVATAR_ID ? (
                    <img
                        src={`/static/images/avatar/${user.avatarId}.jpg`}
                        className="img-fluid circle"
                        height="40"
                        width="40"
                        alt="Avatar"
                    />
                ) : (
                    <span className={`icon-user ${Styles["icon-user"]}`} data-testid="icon-user"></span>
                )}
            </div>
        </div>
    );
};
