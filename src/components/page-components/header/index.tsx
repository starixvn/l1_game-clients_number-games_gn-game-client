import React, { useContext } from "react";
import { User } from "sc-user-service-client/dist/auth";
import { UserInfo } from "../user-info";
import Styles from "./header.module.scss";
import { URLContext } from "../../../_shared/react-contexts/url-context";

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
    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <div className={Styles["header-left"]}>
                        {
                            props.isRenderGames && <img id="img-game-name" src="/static/images/bac-number/game-name.svg" alt="game name" />
                        }
                        {
                            !props.isRenderGames && <a onClick={() => window.location.reload()} className={Styles["site-name"]}>
                                <img id="img-game-name" src="/static/images/logo-site.svg" alt="game name" />
                            </a>
                        }
                    </div>
                    <div className={Styles["header-right"]}>
                        <UserInfo user={props.user} />
                        <button className={Styles["button-setting"]}>
                            <span className={`icon-setting ${Styles["icon-setting"]}`} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
