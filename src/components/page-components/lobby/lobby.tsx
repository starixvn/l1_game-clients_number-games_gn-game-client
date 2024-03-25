import { Socket } from "socket.io-client";
import { BackgroundGalaxy } from "../background";
import { ILobbyConfigs } from "../dashboard/type";
import MusicPlayer from "../music-player";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import Styles from "./lobby.module.scss";
import { LobbyLayout } from "./games/lobby-layout";

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
            <MusicPlayer />
        </div>
    );
};
