import React from "react";
import { User } from "sc-user-service-client/dist/auth";
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
    offerGames: number[];
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
                        <span id="btn-back-home" className={`icon-back ${Styles["back-to-home"]}`}></span>
                        <a onClick={() => window.location.reload()} className={Styles["site-name"]}>
                            <img id="img-game-name" src="/static/images/bac-number/game-name.svg" alt="game name" />
                        </a>
                    </div>

                    <div className={Styles["header-right"]}>
                        <UserInfo user={props.user} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
