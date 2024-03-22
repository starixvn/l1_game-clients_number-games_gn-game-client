import { GameIcon } from "./game-icon";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { GameSettings } from "../../../../game-base/type";
import { useEffect, useRef, useState } from "react";
import { initLobbyGameTransmitter } from "../lobby-game-transmitter";
import { CountdownTimer } from "./countdown-timer";
import { DisabledGameBlock } from "./disable-game-block";
import { useTolgee } from "@tolgee/react";
import { useCommonTranslate } from "../../../../../_shared/react-hooks";
import { reconnectToGameOnLobby } from "../../lobby-socket-connection";
import { usePlayerContext } from "../../../../../_shared/react-contexts";

const messageEventTypes = {
    UM: "um",
    START_NEW_ROUND: "snr",
    SIGNED_IN: "signedIn",
    ERRORCODE: "errorCode",
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
    const [isDisconnectGame, setIsDisconnectGame] = useState(false);
    const isDisabledGameRef = useRef(isDisabledGame);
    const setIsDisabledGameRef = (isDisabled) => {
        isDisabledGameRef.current = isDisabled;
        setIsDisabledGame(isDisabled);
    };
    const [errorMessage, setErrorMessage] = useState("");

    const { session } = usePlayerContext();
    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);
    const language = useTolgee().getLanguage();
    const { t } = useCommonTranslate();

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
            transmitter.register(messageEventTypes.ERRORCODE, handleDisconnect);
        }
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData();
        setIsDisconnectGame(false);
    };

    const handleDisabledGame = ({ um, um_message }: { um: boolean; um_message: Record<string, string> }) => {
        setErrorMessage(um_message[language]);
        setIsDisabledGameRef(um);
    };

    const handleStartNewRound = () => {
        if (isDisabledGameRef.current) {
            setIsDisabledGameRef(false);
            setIsDisconnectGame(false);
            getLobbyData();
        }
    };

    const handleDisconnect = ({ errorCode }: { errorCode: string }) => {
        const failedConnectionErrorCode = "SB0010";
        if (errorCode === failedConnectionErrorCode) {
            setErrorMessage(t("splash_connection_lost"));
            setIsDisconnectGame(true);
        }
    };

    const getLobbyData = () => {
        socket.emit("getLobbyData", { gameName: gameSettings.gameName });
    };

    const reconnectGame = () => {
        reconnectToGameOnLobby(socket, session, gameSettings.id);
    };

    const isEnabledService = !isDisabledGame && !isDisconnectGame;
    return (
        <div
            className={`${Styles["game-board-detail"]} ${!isEnabledService ? "" : Styles["pointer"]}`}
            id={`icon-${gameSettings.gameName.toLowerCase()}`}
            onClick={() => isEnabledService && openGame(gameSettings.id)}
        >
            <GameIcon gameSettings={gameSettings} lobbyGameTransmitter={transmitter} isDisabledGame={!isEnabledService} />
            {!isEnabledService ? (
                <DisabledGameBlock message={errorMessage} isDisconnectGame={isDisconnectGame} reconnectGame={reconnectGame} />
            ) : (
                <div className={Styles["detail"]}>
                    <CountdownTimer lobbyGameTransmitter={transmitter} gameSettings={gameSettings} />
                    <img src="/static/images/lobby/game-board-detail/scoreboard.svg" alt="scoreboard" />
                </div>
            )}
        </div>
    );
};
