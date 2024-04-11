import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter, getLobbyData } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";
import { GameIcon } from "./game-icon";

const DisabledGameBlock = dynamic(() => import("./disable-game-block"));
const CountdownTimer = dynamic(() => import("./countdown-timer"));
const LobbyScoreboard = dynamic(() => import("./scoreboard"));

const messageEventTypes = {
    SIGNED_IN: "signedIn",
    SHOW_DATA: "showData",
};

type Props = {
    gameSettings: GameSettings;
    openGame: Function;
    gameTransmitter: LobbyGameTransmitter;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, openGame, gameTransmitter }) => {
    const [isShow, setIsShow] = useState<boolean>(true);
    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);
    const { reconnectGameTransmitter, socket } = useLobbyConnectionContext();

    useEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, []);

    const onVisibilityChange = () => {
        !document["hidden"] && getLobbyData(socket, gameSettings.id);
    };

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
            <DisabledGameBlock transmitter={transmitter} gameSettings={gameSettings} />
            {isShow && (
                <div className={Styles["detail"]}>
                    <CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />
                    {transmitter && <LobbyScoreboard gameSettings={gameSettings} transmitter={transmitter} />}
                </div>
            )}
        </div>
    );
};
