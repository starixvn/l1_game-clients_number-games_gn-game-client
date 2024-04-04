import { Socket } from "socket.io-client";
import { BackgroundGalaxy } from "../background";
import { ILobbyConfigs } from "../dashboard/type";
import ChangeAvatar from "../header/change-avatar";
import MusicPlayer from "../music-player";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";
import ToolbarGuide from "../hide-toolbar-guide";
import { useState } from "react";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { isMobileOnly, isSafari } from "react-device-detect";

type Props = {
    openGame: Function;
    socket: Socket;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: any;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs, socket, gameTransmitters }) => {
    const [enabledToolbarGuide, setEnabledToolbarGuide] = useState(StorageHelper.get(localStorageKeys.hideToolbarGuide) ?? true);

    const closeToolbarGuide = () => {
        setEnabledToolbarGuide(false);
    };

    return (
        <div className={Styles["lobby-container"]}>
            <BackgroundGalaxy />
            <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            <LobbyLayout lobbyConfigs={lobbyConfigs} socket={socket} gameTransmitters={gameTransmitters} openGame={openGame} />
            <Settings />
            <ChangeAvatar />
            {isMobileOnly && isSafari && <ToolbarGuide isShowToolbarGuide={enabledToolbarGuide} onCloseGuide={closeToolbarGuide} />}
        </div>
    );
};
