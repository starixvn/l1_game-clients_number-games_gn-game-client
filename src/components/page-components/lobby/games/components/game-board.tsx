import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameSettings } from "../../../../game-base/type";
import Styles from "../../lobby.module.scss";
import { CountdownTimer } from "./countdown-timer";
import { DisabledGameBlock } from "./disable-game-block";
import { GameIcon } from "./game-icon";
import { LobbyScoreboard } from "./scoreboard";
import { LobbyGameTransmitter, getLobbyData } from "../../lobby-socket-connection";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";

const messageEventTypes = {
    SIGNED_IN: "signedIn",
    SHOW_DATA: "showData",
};

type Props = {
    gameSettings: GameSettings;
    socket: Socket;
    openGame: Function;
    gameTransmitter: LobbyGameTransmitter;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, socket, openGame, gameTransmitter }) => {
    const [isShow, setIsShow] = useState<boolean>(true);
    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);
    const { reconnectGameTransmitter } = useLobbyConnectionContext();

    useEffect(() => {
        if (gameTransmitter) {
            setTransmitter(gameTransmitter);
        } else {
            const newTransmitter = reconnectGameTransmitter(gameSettings.id);
            setTransmitter(newTransmitter);
        }
    }, [gameTransmitter]);

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(messageEventTypes.SIGNED_IN, handleSignedIn));
            listenerIds.push(transmitter.register(messageEventTypes.SHOW_DATA, handleShowData));
            transmitter.signedIn && getLobbyData(socket, gameSettings.id);
        }
        return () => {
            listenerIds.forEach((listenerId) => transmitter?.unsubscribe(listenerId));
        };
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData(socket, gameSettings.id);
    };

    const handleShowData = ({ showData }: { showData: boolean }) => {
        setIsShow(showData);
    };

    return (
        <div
            className={`${Styles["game-board-detail"]} ${!isShow ? "" : Styles["pointer"]}`}
            id={`icon-${gameSettings.gameName.toLowerCase()}`}
            onClick={() => isShow && openGame(gameSettings.id)}
        >
            <GameIcon gameSettings={gameSettings} transmitter={transmitter} />
            <DisabledGameBlock socket={socket} transmitter={transmitter} gameSettings={gameSettings} />
            {isShow && (
                <div className={Styles["detail"]}>
                    <CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />
                    {transmitter && <LobbyScoreboard gameSettings={gameSettings} transmitter={transmitter} />}
                </div>
            )}
        </div>
    );
};
