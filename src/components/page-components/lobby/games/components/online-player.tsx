import { useEffect, useState } from "react";
import { LobbyGameTransmitter, LobbyMessageEvents } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";

type Props = {
    transmitter: LobbyGameTransmitter;
};

export const OnlinePlayer: React.FC<Props> = ({ transmitter }) => {
    const [isShow, setIsShow] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState<string[]>(null);

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(LobbyMessageEvents.SHOW_DATA, handleShowData));
            listenerIds.push(transmitter.register(LobbyMessageEvents.PLAYERS, handlePlayers));
            listenerIds.push(transmitter.register(LobbyMessageEvents.PLAYER, handlePlayerJoinGame));
            listenerIds.push(transmitter.register(LobbyMessageEvents.OUTGAME, handlePlayerOutGame));
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
        onlinePlayers?.length > 0 && (
            <div className={Styles["user-playing"]}>
                <span className={`icon-user-lobby ${Styles["user-playing-icon"]}`}></span>
                <span className={Styles["user-playing-value"]}>{onlinePlayers.length}</span>
            </div>
        )
    );
};

export default OnlinePlayer;
