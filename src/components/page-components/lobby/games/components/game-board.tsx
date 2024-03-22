import { GameIcon } from "./game-icon";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { GameSettings } from "../../../../game-base/type";
import { useEffect, useState } from "react";
import { initLobbyGameTransmitter } from "../lobby-game-transmitter";
import { CountdownTimer } from "./countdown-timer";
import { DisabledGameBlock } from "./disable-game-block";

const messageEventTypes = {
    SIGNED_IN: "signedIn",
    SHOW_DATA: "showData",
};

type Props = {
    gameSettings: GameSettings;
    socket: Socket;
    openGame: Function;
};

export type LobbyGameTransmitter = {
    register: (messageKey: string, handleMessage: Function) => string;
    broadcast: (message: any) => void;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, socket, openGame }) => {
    const [isShow, setIsShow] = useState<boolean>(null);

    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);

    useEffect(() => {
        const lobbyGameTransmitter = initLobbyGameTransmitter(socket, gameSettings.gameName);
        setTransmitter(lobbyGameTransmitter);
        return () => {
            setTransmitter(null);
            lobbyGameTransmitter.clearAllListener();
        };
    }, [socket, gameSettings.gameName]);

    useEffect(() => {
        if (transmitter) {
            transmitter.register(messageEventTypes.SIGNED_IN, handleSignedIn);
            transmitter.register(messageEventTypes.SHOW_DATA, handleShowData);
        }
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData();
    };

    const handleShowData = ({ showData }: { showData: boolean }) => {
        setIsShow(showData);
    };

    const getLobbyData = () => {
        socket.emit("getLobbyData", { gameName: gameSettings.gameName });
    };

    return (
        <div
            className={`${Styles["game-board-detail"]} ${!isShow ? "" : Styles["pointer"]}`}
            id={`icon-${gameSettings.gameName.toLowerCase()}`}
            onClick={() => isShow && openGame(gameSettings.id)}
        >
            <GameIcon gameSettings={gameSettings} lobbyGameTransmitter={transmitter} />
            <DisabledGameBlock socket={socket} transmitter={transmitter} gameSettings={gameSettings} />
            {isShow && (
                <div className={Styles["detail"]}>
                    <CountdownTimer lobbyGameTransmitter={transmitter} gameSettings={gameSettings} />
                    <img src="/static/images/lobby/game-board-detail/scoreboard.svg" alt="scoreboard" />
                </div>
            )}
        </div>
    );
};
