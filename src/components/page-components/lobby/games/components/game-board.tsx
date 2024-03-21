import { GameIcon } from "./game-icon";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { GameSettings } from "../../../../game-base/type";
import { useEffect, useRef, useState } from "react";
import { initLobbyGameTransmitter } from "../lobby-game-transmitter";
import { CountdownTimer } from "./countdown-timer";
import { DisabledGameBlock } from "./disable-game-block";
import { useTolgee } from "@tolgee/react";

const messageEventTypes = {
    UM: "um",
    START_NEW_ROUND: "snr",
    SIGNED_IN: "signedIn",
};

type Props = {
    gameSettings: GameSettings;
    socket: Socket;
    openGame: Function;
};

export type LobbyGameTransmitter = {
    register: (messageKey: string, handleMessage: Function) => string;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, socket, openGame }) => {
    const [isDisabledGame, setIsDisabledGame] = useState(false);
    const isDisabledGameRef = useRef(isDisabledGame);
    const setIsDisabledGameRef = (isDisabled) => {
        isDisabledGameRef.current = isDisabled;
        setIsDisabledGame(isDisabled);
    };
    const [umMessage, setUmMessage] = useState("");
    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);
    const language = useTolgee().getLanguage();

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
            transmitter.register(messageEventTypes.UM, handleDisabledGame);
            transmitter.register(messageEventTypes.START_NEW_ROUND, handleStartNewRound);
        }
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData();
    };

    const handleDisabledGame = ({ um, um_message }: { um: boolean; um_message: Record<string, string> }) => {
        setIsDisabledGameRef(um);
        setUmMessage(um_message[language]);
    };

    const handleStartNewRound = () => {
        if (isDisabledGameRef.current) {
            setIsDisabledGameRef(false);
            getLobbyData();
        }
    };

    const getLobbyData = () => {
        socket.emit("getLobbyData", { gameName: gameSettings.gameName });
    };
    return (
        <div
            className={`${Styles["game-board-detail"]} ${isDisabledGame ? "" : Styles["pointer"]}`}
            id={`icon-${gameSettings.gameName.toLowerCase()}`}
            onClick={() => !isDisabledGame && openGame(gameSettings.id)}
        >
            <GameIcon gameSettings={gameSettings} lobbyGameTransmitter={transmitter} isDisabledGame={isDisabledGame} />
            {isDisabledGame ? (
                <DisabledGameBlock message={umMessage} />
            ) : (
                <div className={Styles["detail"]}>
                    <CountdownTimer lobbyGameTransmitter={transmitter} gameSettings={gameSettings} />
                    <img src="/static/images/lobby/game-board-detail/scoreboard.svg" alt="scoreboard" />
                </div>
            )}
        </div>
    );
};
