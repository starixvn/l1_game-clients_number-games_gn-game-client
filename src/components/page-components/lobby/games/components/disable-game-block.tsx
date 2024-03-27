import { useEffect, useRef, useState } from "react";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { ResourceTypes } from "../../../../../_shared/resources";
import Styles from "../../lobby.module.scss";
import { Socket } from "socket.io-client";
import { useLobbyConnectionContext, usePlayerContext } from "../../../../../_shared/react-contexts";
import { useTolgee } from "@tolgee/react";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter, getLobbyData } from "../../lobby-socket-connection";

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
    const { removeGameTransmitter, reconnectGameTransmitter } = useLobbyConnectionContext();
    const { session } = usePlayerContext();
    const language = useTolgee().getLanguage();

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(messageEventTypes.SIGNED_IN, handleSignedIn));
            listenerIds.push(transmitter.register(messageEventTypes.UM, handleDisabledGame));
            listenerIds.push(transmitter.register(messageEventTypes.START_NEW_ROUND, handleStartNewRound));
            listenerIds.push(transmitter.register(messageEventTypes.ERRORCODE, handleDisconnect));
        }
        return () => {
            listenerIds.forEach((listenerId) => transmitter?.unsubscribe(listenerId));
        };
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
            getLobbyData(socket, gameSettings.id);
        }
    };

    const handleDisconnect = ({ errorCode }: { errorCode: string }) => {
        const failedConnectionErrorCode = "SB0010";
        if (errorCode === failedConnectionErrorCode) {
            setErrorMessage(t(`${ResourceTypes.COMMON}.splash_connection_lost`));
            transmitter.broadcast({ showData: false });
            setIsDisconnectGame(true);
            removeGameTransmitter(gameSettings.id);
        }
    };
    const reconnectGame = () => {
        reconnectGameTransmitter(gameSettings.id);
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
