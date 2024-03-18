import { GameIcon } from "./game-icon";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { GameSettings } from "../../../../game-base/type";
import { useEffect, useState } from "react";
import { initLobbyGameTransmitter } from "../lobby-game-transmitter";

type Props = {
    gameSettings: GameSettings;
    socket: Socket;
    openGame: Function;
};
export type LobbyGameTransmitter = {
    register: (messageKey: string, handleMessage: Function) => string;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, socket, openGame }) => {
    const [transmitter, setTransmitter] = useState(null);
    useEffect(() => {
        const lobbyGameTransmitter = initLobbyGameTransmitter(socket, gameSettings.gameName);
        setTransmitter(lobbyGameTransmitter);
        return () => {
            setTransmitter(null);
            lobbyGameTransmitter.clearAllListener();
        };
    }, [socket, gameSettings.gameName]);

    return (
        <div className={Styles["game-board-detail"]} id="ico-bacball" onClick={() => openGame(gameSettings.id)}>
            <GameIcon gameName={gameSettings.gameName} lobbyGameTransmitter={transmitter} />
            <div className={Styles["detail"]}>
                <div className={Styles["detail-top"]}>
                    <span className="icon-clock" />
                    Starting bet
                </div>
                <img src="/static/images/game-board-detail/scoreboard.svg" alt="scoreboard" />
            </div>
        </div>
    );
};
