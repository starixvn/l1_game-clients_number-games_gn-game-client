import React, { useEffect, useState } from "react";
import HeaderTitle from "./header-title";
import Styles from "./header.module.scss";
import Setting from "./setting";
import { UserInfo } from "./user-info";
import { GlobalMessageTransmitter, registerGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";

export const getLogoName = () => {
    return "new-number-game";
};

const Header = () => {
    const [openingGameId, setOpeningGameId] = useState(0);
    const [isRenderGames, setIsRenderGames] = useState(openingGameId > 0);

    useEffect(() => {
        registerGlobalMessageEvent("openingGameId", ({ openingGameId }) => {
            setOpeningGameId(openingGameId);
            setIsRenderGames(openingGameId > 0);
        });

        return () => {
            GlobalMessageTransmitter.clearAllListener();
        }
    }, []);


    return (
        <header className={`${Styles.header}`} data-testid="header">
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <HeaderTitle isRenderGames={isRenderGames} openingGameId={openingGameId} />
                    <div className={Styles["header-right"]}>
                        <UserInfo isLobby={!isRenderGames} />
                        {!isRenderGames && <Setting />}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
