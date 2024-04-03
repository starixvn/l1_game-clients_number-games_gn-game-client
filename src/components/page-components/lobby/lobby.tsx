import { Socket } from "socket.io-client";
import { BackgroundGalaxy } from "../background";
import { ILobbyConfigs } from "../dashboard/type";
import ChangeAvatar from "../header/change-avatar";
import MusicPlayer from "../music-player";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import { LobbyLayout } from "./games/lobby-layout";
import Styles from "./lobby.module.scss";

type Props = {
    openGame: Function;
    socket: Socket;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: any;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs, socket, gameTransmitters }) => {
    return (
        <div className={Styles["lobby-container"]}>
            <BackgroundGalaxy />
            <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
            <LobbyLayout lobbyConfigs={lobbyConfigs} socket={socket} gameTransmitters={gameTransmitters} openGame={openGame} />
            <Settings />
            <ChangeAvatar />
        </div>
    );
};
