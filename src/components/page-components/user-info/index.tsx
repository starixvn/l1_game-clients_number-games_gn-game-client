import React from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { User } from "sc-user-service-client/dist/auth";

import { numberRoundDownWithCommas } from "../../../_shared/helpers/number-helper";
import { MAX_AVATAR_ID } from "../dashboard/register/avatar-gallery";
import Styles from "./user-info.module.scss";

export const UserInfo: React.FC<{ user: User; customizeClass?: string }> = ({ user, customizeClass }) => {
    let deviceClass = "";
    let currencyUser = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }

    if (user.isDisplayPlayerCurrency) {
        currencyUser = user.currency;
    }

    return (
        <div className={`${Styles["user"]} ${customizeClass ? Styles[customizeClass] : ""} ${deviceClass}`}>
            <div className={Styles["info"]}>
                <div id="user-info_user-name" className={Styles["user-name"]} data-testid="user-name">
                    {user.name}
                </div>
                <div key={user.red} className={`${Styles.balance}`} data-testid="balance">
                    <span id="user-info_balance">{numberRoundDownWithCommas(user.red ? user.red : 0)}</span>

                    <img src="/static/images/icon-coin.svg" className="img-fluid" alt="icon-coin" />
                </div>
            </div>
            <div className={Styles["avatar"]}>
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
