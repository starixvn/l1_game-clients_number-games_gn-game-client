import React from "react";
import { User } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { SetingEventActionType, useSettingDispatch } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { UserInfo } from "../user-info";
import Styles from "./header.module.scss";

type Props = {
    openingGameId: number;
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
    const { gameSettings } = getAppSettings();
    const appSetting = gameSettings[props.openingGameId];

    const tolgeeNamespace = appSetting ? appSetting["tolgeeNamespace"] : "";

    const { t } = useTranslator([tolgeeNamespace]);

    const settingDispatch = useSettingDispatch();
    const openSetting = () => {
        settingDispatch({
            type: SetingEventActionType.TOGGLE_SETTING,
            payload: {
                isShowedSetting: true,
            },
        });
    };

    const headerTitle = `${props.isRenderGames ? `${t(`${tolgeeNamespace}.game_name_${props.openingGameId}`)}` : "SABA NUMBER GAME"}`;

    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <div className={Styles["header-left"]}>{headerTitle}</div>
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
