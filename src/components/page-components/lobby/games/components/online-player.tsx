import { useEffect, useState } from "react";
import Styles from "../../lobby.module.scss";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";

type Props = {
    transmitter: LobbyGameTransmitter;
};

const messagesEventTypes = {
    SHOW_DATA: "showData",
    PLAYERS: "players",
    PLAYER: "player",
    OUTGAME: "outgame",
};

export const OnlinePlayer: React.FC<Props> = ({ transmitter }) => {
    const [isShow, setIsShow] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>(null);

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(messagesEventTypes.SHOW_DATA, handleShowData));
            listenerIds.push(transmitter.register(messagesEventTypes.PLAYERS, handlePlayers));
            listenerIds.push(transmitter.register(messagesEventTypes.PLAYER, handlePlayerJoinGame));
            listenerIds.push(transmitter.register(messagesEventTypes.OUTGAME, handlePlayerOutGame));
        }
        return () => {
            listenerIds.forEach((listenerId) => transmitter?.unsubscribe(listenerId));
        };
    }, [transmitter]);

    const handleShowData = ({ showData }: { showData: boolean }) => {
        setIsShow(showData);
    };

    const handlePlayers = ({ players }) => {
        setIsShow(true);
        setOnlinePlayers(Object.keys(players));
    };

    const handlePlayerJoinGame = ({ player }) => {
        setOnlinePlayers((prevPlayers) => {
            const onlinePlayer = prevPlayers?.find((playerId) => playerId === player.id);
            if (!onlinePlayer && prevPlayers) {
                return [...prevPlayers, player.id];
            }
            return prevPlayers;
        });
    };

    const handlePlayerOutGame = ({ outgame }) => {
        setOnlinePlayers((prevPlayers) => {
            const index = prevPlayers?.indexOf(outgame.playerId);
            if (index >= 0) {
                const players = [...prevPlayers];
                players.splice(index, 1);
                return players;
            }
            return prevPlayers;
        });
    };

    return (
        isShow &&
        onlinePlayers !== null && (
            <div className={Styles["user-playing"]}>
                <span className="icon-user-lobby"></span>
                <span className={Styles["user-playing-value"]}>{onlinePlayers?.length || 0}</span>
            </div>
        )
    );
};
