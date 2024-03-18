import { useEffect, useState } from "react";
import { LobbyGameTransmitter } from "./game-board";
import Styles from "./game-icon.module.scss";

type Props = {
    lobbyGameTransmitter: LobbyGameTransmitter;
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
        lobbyGameTransmitter.register(messagesEventTypes.PLAYER, handlePlayerJoinGame);
        lobbyGameTransmitter.register(messagesEventTypes.OUTGAME, handlePlayerOutGame);
    };

    const handlePlayers = ({ players }) => {
        setOnlinePlayers(Object.keys(players));
    };

    const handlePlayerJoinGame = ({ player }) => {
        setOnlinePlayers((prevPlayers) => {
            const onlinePlayer = prevPlayers.find((playerId) => playerId === player.id);
            if (!onlinePlayer) {
                return [...prevPlayers, player.id];
            }
            return prevPlayers;
        });
    };

    const handlePlayerOutGame = ({ outgame }) => {
        setOnlinePlayers((prevPlayers) => {
            const index = prevPlayers.indexOf(outgame.playerId);
            if (index >= 0) {
                const players = [...prevPlayers];
                players.splice(index, 1);
                return players;
            }
            return prevPlayers;
        });
    };

    return (
        <div className={Styles["user-playing"]}>
            <span className={Styles["user-playing-icon"]}></span>
            <span className={Styles["user-playing-value"]}>{onlinePlayers?.length || 0}</span> playing
        </div>
    );
};
