import { Socket } from "socket.io-client";
import { getAppSettings } from "../../../_shared/app-settings";
import { BackgroundGalaxy } from "../background";
import { ILobbyConfigs } from "../dashboard/type";
import MusicPlayer from "../music-player";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import { GameBoard } from "./games/components/game-board";
import Styles from "./lobby.module.scss";

type Props = {
    openGame: Function;
    socket: Socket;
    lobbyConfigs: ILobbyConfigs;
};

export const Lobby: React.FC<Props> = ({ openGame, socket, lobbyConfigs }) => {
    const { gameSettings: allGameSetting } = getAppSettings();
    const gamesSettings = Object.values(allGameSetting);

    return (
        socket && (
            <div className={Styles["lobby-container"]}>
                <BackgroundGalaxy />
                <Banner openGame={openGame} lobbyConfigs={lobbyConfigs} />
                {gamesSettings?.map((gameSettings) => (
                    <GameBoard
                        key={`game-board-${gameSettings.gameName}`}
                        gameSettings={gameSettings}
                        socket={socket}
                        openGame={openGame}
                    />
                ))}
                <Settings />
                <MusicPlayer />
            </div>
        )
    );
};
