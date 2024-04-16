import React, { useEffect, useMemo, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { numberRoundDownWithCommas } from "../../../../_shared/helpers/number-helper";
import { SettingEventActionType, usePlayerContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";
import { MAX_AVATAR_ID } from "../../dashboard/register/avatar-gallery";
import Styles from "./user-info.module.scss";
const { v4: uuidv4 } = require("uuid");

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
                <UserName name={user?.name || ""} />
                <div className={`${Styles.balance}`} data-testid="balance">
                    <span id="user-info_balance" className={Styles["balance-text"]}>
                        <UserAmount amount={user?.red || 0} />
                        <UserCurrency currency={user.currency} isDisplayPlayerCurrency={user.isDisplayPlayerCurrency} />
                    </span>
                    <img src="/static/images/icon-coin.svg" className="img-fluid" alt="icon-coin" />
                </div>
            </div>
            <UserAvatar avatarId={user?.avatarId} classCursor={classCursor} handleClickAvatar={handleClickAvatar} />
        </div>
    );
};

const UserName: React.FC<{ name: string }> = ({ name }) => {
    return useMemo(() => {
        return (
            <div id="user-info_user-name" className={Styles["user-name"]} data-testid="user-name">
                {name}
            </div>
        );
    }, [name]);
};

const UserAmount: React.FC<{ amount: number }> = ({ amount }) => {
    return useMemo(() => {
        return (
            <>
                <span data-testid="amount">{numberRoundDownWithCommas(amount)}</span>
                <span>{` `}</span>
            </>
        );
    }, [amount]);
};

const UserCurrency: React.FC<{ currency: string; isDisplayPlayerCurrency: boolean }> = ({ currency, isDisplayPlayerCurrency }) => {
    return useMemo(() => {
        if (!isDisplayPlayerCurrency) {
            return <></>;
        }

        return <span data-testid="currency">{currency}</span>;
    }, [currency, isDisplayPlayerCurrency]);
};

const UserAvatar: React.FC<{ avatarId: number; classCursor: string; handleClickAvatar: Function }> = ({
    avatarId,
    classCursor,
    handleClickAvatar,
}) => {
    return useMemo(() => {
        return (
            <div data-testid="avatar" className={`${Styles["avatar"]} ${Styles[classCursor]}`} onClick={() => handleClickAvatar?.()}>
                {avatarId > 0 && avatarId <= MAX_AVATAR_ID ? (
                    <img src={`/static/images/avatar/${avatarId}.jpg`} className="img-fluid circle" height="40" width="40" alt="Avatar" />
                ) : (
                    <span className={`icon-user ${Styles["icon-user"]}`} data-testid="icon-user"></span>
                )}
            </div>
        );
    }, [avatarId]);
};

export default UserInfo;
