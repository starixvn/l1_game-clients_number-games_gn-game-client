import { useEffect, useState } from "react";

import { GlobalTransmitterEvent, registerGlobalMessageEvent, unsubscribeGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { ILobbyConfigs } from "../dashboard/type";
import { LobbyGameTransmitter } from "../lobby/lobby-socket-connection";
import SwitchGame from "../switch-game";
import UserInfo from "../user-info";
import Styles from "./bottom-bar.module.scss";

interface BottomBarProps {
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
}

const BottomBar: React.FC<BottomBarProps> = ({ lobbyConfigs, gameTransmitters, openGame }) => {
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
        <div className={Styles["bottom-bar"]}>
            <UserInfo isLobby={!isRenderGames} />
            <SwitchGame />
        </div>
    );
};

export default BottomBar;
