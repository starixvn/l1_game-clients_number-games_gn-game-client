import React, { forwardRef, useEffect, useState } from "react";

import {
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { Settings } from "../../game-components/settings";
import HeaderTitle from "./header-title";
import Styles from "./header.module.scss";
const Header = forwardRef<HTMLElement, { gameId: number }>((props, ref) => {
    const isRenderGames = props.gameId > 0;

    return (
        <header className={`${Styles.header}`} data-testid="header" ref={ref} data-game-id={props.gameId}>
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <HeaderTitle isRenderGames={isRenderGames} openingGameId={props.gameId} />
                    <div className={Styles["header-right"]}>
                        <Settings />
                    </div>
                </div>
            </div>
        </header>
    );
});

Header.displayName = "Header";

export default Header;
