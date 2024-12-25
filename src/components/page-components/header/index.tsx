import React, { forwardRef, useEffect, useState } from "react";

import { GlobalTransmitterEvent, registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { Settings } from "../../game-components/settings";
import HeaderTitle from "./header-title";
import Styles from "./header.module.scss";
import Setting from "./setting";

const Header = forwardRef<HTMLElement>((props, ref) => {
    const [openingGameId, setOpeningGameId] = useState(0);

    useEffect(() => {
        const gameScriberId = registerGlobalMessageEvent(GlobalTransmitterEvent.OPEN_GAME_ID, ({ openingGameId }) => {
            setOpeningGameId(openingGameId);
        });

        return () => {
            unsubscribeGlobalMessageEvent(gameScriberId);
        };
    }, []);

    const isRenderGames = openingGameId > 0;
    return (
        <header className={`${Styles.header}`} data-testid="header" ref={ref} data-game-id={openingGameId}>
            <div className="game-container d-flex">
                <div className={Styles["header-container"]}>
                    <HeaderTitle isRenderGames={isRenderGames} openingGameId={openingGameId} />
                    <div className={Styles["header-right"]}>
                        <Settings />
                        <Setting />
                    </div>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
