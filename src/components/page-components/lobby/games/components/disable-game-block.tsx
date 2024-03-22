import { useEffect, useRef, useState } from "react";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../../_shared/resources";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { LobbyGameTransmitter } from "./game-board";
import { usePlayerContext } from "../../../../../_shared/react-contexts";
import { useTolgee } from "@tolgee/react";
import { reconnectToGameOnLobby } from "../../lobby-socket-connection";
import { GameSettings } from "../../../../game-base/type";

const messageEventTypes = {
    SIGNED_IN: "signedIn",
    UM: "um",
    START_NEW_ROUND: "snr",
    ERRORCODE: "errorCode",
};

type Props = {
    socket: Socket;
    transmitter: LobbyGameTransmitter;
    gameSettings: GameSettings;
};

export const DisabledGameBlock: React.FC<Props> = ({ socket, transmitter, gameSettings }) => {
    const { t } = useTranslator();
    const [isDisabledGame, setIsDisabledGame] = useState(false);
    const [isDisconnectGame, setIsDisconnectGame] = useState(false);
    const isDisabledGameRef = useRef(isDisabledGame);
    const setIsDisabledGameRef = (isDisabled) => {
        isDisabledGameRef.current = isDisabled;
        setIsDisabledGame(isDisabled);
    };
    const [errorMessage, setErrorMessage] = useState("");

    const { session } = usePlayerContext();
    const language = useTolgee().getLanguage();

    useEffect(() => {
        if (transmitter) {
            transmitter.register(messageEventTypes.SIGNED_IN, handleSignedIn);
            transmitter.register(messageEventTypes.UM, handleDisabledGame);
            transmitter.register(messageEventTypes.START_NEW_ROUND, handleStartNewRound);
            transmitter.register(messageEventTypes.ERRORCODE, handleDisconnect);
        }
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && setIsDisconnectGame(false);
        transmitter.broadcast({ showData: isDisabledGameRef.current || true });
    };

    const handleDisabledGame = ({ um, um_message }: { um: boolean; um_message: Record<string, string> }) => {
        setErrorMessage(um_message[language]);
        transmitter.broadcast({ showData: !um });
        setIsDisabledGameRef(um);
    };

    const handleStartNewRound = () => {
        if (isDisabledGameRef.current) {
            transmitter.broadcast({ showData: true });
            setIsDisabledGameRef(false);
            setIsDisconnectGame(false);
            getLobbyData();
        }
    };

    const handleDisconnect = ({ errorCode }: { errorCode: string }) => {
        const failedConnectionErrorCode = "SB0010";
        if (errorCode === failedConnectionErrorCode) {
            setErrorMessage(t(`${ResourceTypes.COMMON}.splash_connection_lost`));
            transmitter.broadcast({ showData: false });
            setIsDisconnectGame(true);
        }
    };

    const getLobbyData = () => {
        socket.emit("getLobbyData", { gameName: gameSettings.gameName });
    };

    const reconnectGame = () => {
        reconnectToGameOnLobby(socket, session, gameSettings.id);
    };

    const isShow = isDisabledGame || isDisconnectGame;
    return (
        isShow && (
            <>
                <div className={Styles["disable-game-block"]}></div>
                <div className={Styles["error-message"]}>
                    <div>{errorMessage || t(`${ResourceTypes.COMMON}.message_disabled_game`)}</div>
                    {isDisconnectGame && (
                        <button className={`btn-green w-70 ${Styles["btn-reconnect"]}`} onClick={() => reconnectGame()}>
                            {t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)}
                        </button>
                    )}
                </div>
            </>
        )
    );
};
