import React from "react";
import { User } from "sc-user-service-client/dist/auth";
import { Settings } from "../../game-components/settings";
import { UserInfo } from "../user-info";
import Styles from "./header.module.scss";

type Props = {
    user: User;
    enabledSound: boolean;
    enabledNotification: boolean;
    onToggleSound: Function;
    onToggleNotification: Function;
    toggleHistoryModal: Function;
    toggleGuideModal: Function;
    toggleAnnouncementModal: Function;
    updateFavoriteGames: Function;
    favoriteGames: number[];
    offerGames: number[];
    enabledQuickBet?: boolean;
    updateEnabledQuickBet?: Function;
    isShowBoostedOdds: boolean;
    promotionNotifications: [];
    isShowToolbarGuide: boolean;
};

export const getLogoName = () => {
    return "new-number-game";
};

const Header: React.FC<Props> = (props) => {
    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <div className={Styles["header-left"]}>
                        <span className={`icon-back ${Styles["back-to-home"]}`}></span>
                        <a onClick={() => window.location.reload()} className={Styles["site-name"]}>
                            Bac Ball
                        </a>
                    </div>

                    <div className={Styles["header-right"]}>
                        {
                            <Settings
                                enabledSound={props.enabledSound}
                                enabledNotification={props.enabledNotification}
                                onToggleSound={props.onToggleSound}
                                onToggleNotification={props.onToggleNotification}
                                toggleHistoryModal={props.toggleHistoryModal}
                                toggleGuideModal={props.toggleGuideModal}
                                toggleAnnouncementModal={props.toggleAnnouncementModal}
                                favoriteGames={props.favoriteGames}
                                offerGames={props.offerGames}
                                updateFavoriteGames={props.updateFavoriteGames}
                                enabledQuickBet={props.enabledQuickBet}
                                updateEnabledQuickBet={props.updateEnabledQuickBet}
                                isShowBoostedOdds={props.isShowBoostedOdds}
                                promotionNotifications={props.promotionNotifications}
                                isShowToolbarGuide={props.isShowToolbarGuide}
                            />
                        }
                        <UserInfo user={props.user} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
