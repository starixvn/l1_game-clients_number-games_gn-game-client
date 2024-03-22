import React from "react";
import HeaderTitle from "./header-title";
import Styles from "./header.module.scss";
import Setting from "./setting";
import { UserInfo } from "./user-info";

type Props = {
    openingGameId: number;
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
                    <HeaderTitle isRenderGames={props.isRenderGames} openingGameId={props.openingGameId} />
                    <div className={Styles["header-right"]}>
                        <UserInfo />
                        {!props.isRenderGames && <Setting />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
