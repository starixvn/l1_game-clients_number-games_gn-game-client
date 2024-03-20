import { useEffect, useMemo, useState } from "react";
import { Socket } from "socket.io-client";

import { getAppSettings } from "../../../_shared/app-settings";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { BackgroundGalaxy } from "../background";
import Settings from "../settings";
import { Banner } from "./games/components/banner";
import { GameBoard } from "./games/components/game-board";
import { initLobbySocket } from "./lobby-socket-connection";
import Styles from "./lobby.module.scss";
import { LobbyConfigs } from "./type";

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
        const offerGameIds = [1001, 1002];
        const socketGateWay = initLobbySocket(session, offerGameIds);
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
                <BackgroundGalaxy />
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
