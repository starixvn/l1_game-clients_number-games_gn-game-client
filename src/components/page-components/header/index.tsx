import React, { useContext } from "react";
import { User } from "sc-user-service-client/dist/auth";
import { UserInfo } from "../user-info";
import Styles from "./header.module.scss";
import { URLContext } from "../../../_shared/react-contexts/url-context";
import { SetingEventActionType, useSettingDispatch } from "../../../_shared/react-contexts";

type Props = {
    user: User;
    toggleAnnouncementModal: Function;
    offerGames: number[];
    isShowToolbarGuide: boolean;
    isRenderGames: boolean;
};

export const getLogoName = () => {
    return "new-number-game";
};

const Header: React.FC<Props> = (props) => {
    const settingDispatch = useSettingDispatch();
    const openSetting = () => {
        settingDispatch({
            type: SetingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: true,
            },
        });
    };

    const imageUrl = `/static/images/${props.isRenderGames ? "bac-number/game-name" : "logo-site"}.svg`;

    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <div className={Styles["header-left"]}>
                        <img id="img-game-name" src={imageUrl} alt="game name" />
                    </div>
                    <div className={Styles["header-right"]}>
                        <UserInfo user={props.user} />
                        {!props.isRenderGames && (
                            <button className={Styles["button-setting"]} onClick={openSetting}>
                                <span className={`icon-setting ${Styles["icon-setting"]}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
