import { useEffect, useMemo, useState } from "react";
import { Banner } from "./games/components/banner";
import { GameIcon } from "./games/components/game-icon";
import { initLobbySocket } from "./lobby-socket-connection";
import Styles from "./lobby.module.scss";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { Socket } from "socket.io-client";
import { LobbyConfigs } from "./type";
import { GameBoard } from "./games/components/game-board";
import { getAppSettings } from "../../../_shared/app-settings";
import Settings from "../settings";

type Props = {
    openGame: Function;
    lobbyConfigs: LobbyConfigs;
};

export const Lobby: React.FC<Props> = ({ openGame, lobbyConfigs }) => {
    const [socket, setSocket] = useState<Socket>(null);
    const { session } = usePlayerContext();

    useEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        onStart();
        // let socketGateWay;
        // if (lobbyConfigs?.categories?.length > 0) {
        // const offerGameIds = lobbyConfigs.categories[0].gameSettings.map((setting) => setting.gameId);
        // socketGateWay = initLobbySocket(session, offerGameIds);
        // setSocket(socketGateWay);
        // }

        return () => {
            removeEventListener("visibilitychange", onVisibilityChange);
        };
        // }, [lobbyConfigs.categories]);
    }, []);

    const onStart = () => {
        let socketGateWay;
        const offerGameIds = [1001];
        socketGateWay = initLobbySocket(session, offerGameIds);
        setSocket(socketGateWay);
    };

    const onDestroy = () => {
        setSocket((prevSocket) => {
            prevSocket?.disconnect();
            return null;
        });
    };

    const onVisibilityChange = () => {
        document.visibilityState === "hidden" ? onDestroy() : onStart();
    };

    // const gamesSettings = useMemo(() => {
    //     if (lobbyConfigs?.categories?.length > 0) {
    //         const { gameSettings: allGameSetting } = getAppSettings();
    //         const gameIds = lobbyConfigs.categories[0].gameSettings.map((config) => config.gameId);
    //         return Object.values(allGameSetting).filter((setting) => gameIds.includes(setting.id));
    //     }
    // }, [lobbyConfigs.categories]);

    const { gameSettings: allGameSetting } = getAppSettings();
    const gamesSettings = Object.values(allGameSetting);

    return (
        socket && (
            <div className={Styles["lobby-container"]}>
                <div className="background-galaxy">
                    <img className="galaxy-2" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                    <img className="galaxy-1" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                </div>
                <div className="star-field">
                    <div className="layer"></div>
                    <div className="layer"></div>
                    <div className="layer"></div>
                </div>
                <Banner />
                {gamesSettings?.map((gameSettings) => (
                    <GameBoard
                        key={`game-board-${gameSettings.gameName}`}
                        gameSettings={gameSettings}
                        socket={socket}
                        openGame={openGame}
                    />
                ))}
                <Settings />
            </div>
        )
    );
};
