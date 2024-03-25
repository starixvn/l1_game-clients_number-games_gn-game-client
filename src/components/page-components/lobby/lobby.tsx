import { useEffect } from "react";
import { SSOResponse } from "sc-user-service-client/dist/auth";
import { LobbyResponse } from "sc-user-service-client/dist/lobby";
import { Socket } from "socket.io-client";
import { getAppSettings } from "../../../_shared/app-settings";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { LobbyEventActionType, useLobbyDispatch } from "../../../_shared/react-contexts/lobby-context";
import { getLobbyConfigs } from "../../../services/auth-service";
import { BackgroundGalaxy } from "../background";
import MusicPlayer from "../music-player";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import { GameBoard } from "./games/components/game-board";
import Styles from "./lobby.module.scss";
import { LobbyConfigs } from "./type";

type Props = {
    openGame: Function;
    lobbyConfigs: LobbyConfigs;
    socket: Socket;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs, socket }) => {
    const { gameSettings: allGameSetting } = getAppSettings();
    const gamesSettings = Object.values(allGameSetting);
    const authContext = usePlayerContext();
    const lobbyDispatch = useLobbyDispatch();

    const getConfigs = async (session: SSOResponse) => {
        const lobby: LobbyResponse = await getLobbyConfigs(session);

        if (lobby?.lobbyConfigs) {
            lobbyDispatch({
                type: LobbyEventActionType.LOBBY_CONFIGS,
                payload: { lobbyConfigs: lobby?.lobbyConfigs },
            });
        } else {
            throw new Error("Can not get lobby configs");
        }
    };

    useEffect(() => {
        if (authContext.session) {
            getConfigs(authContext.session);
        }
    }, [authContext.session]);

    return (
        socket && (
            <div className={Styles["lobby-container"]}>
                <BackgroundGalaxy />
                <Banner openGame={openGame} />
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
