import { useEffect, useState } from "react";
import { LobbyGameTransmitter } from "./game-board";
import Styles from "./game-icon.module.scss";

type Props = {
    lobbyGameTransmitter?: LobbyGameTransmitter;
};

const messagesEventTypes = {
    PLAYERS: "players",
    PLAYER: "player",
    OUTGAME: "outgame",
};

export const OnlinePlayer: React.FC<Props> = ({ lobbyGameTransmitter }) => {
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>(null);

    useEffect(() => {
        lobbyGameTransmitter && registerPlayerEvents();
    }, [lobbyGameTransmitter]);

    const registerPlayerEvents = () => {
        lobbyGameTransmitter.register(messagesEventTypes.PLAYERS, handlePlayers);
    };

    const handlePlayers = ({ players }) => {
        setOnlinePlayers(Object.keys(players));
    };

    return (
        <div className={Styles["user-playing"]}>
            <span className={Styles["user-playing-icon"]}></span>
            <span className={Styles["user-playing-value"]}>{onlinePlayers?.length}</span> playing
        </div>
    );
};
