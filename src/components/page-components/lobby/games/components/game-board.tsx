import { useTolgee } from "@tolgee/react";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { GameStateContextModel } from "../../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { BacBallBigRoadConverter, BacBallBigRoadElement } from "../../../../../games/bac-ball/scoreboard-elements";
import { BacBallSettlementResult } from "../../../../../games/bac-ball/types";
import { GameSettings, Round } from "../../../../game-base/type";
import { SwitchableScoreboard } from "../../../../game-components/round-history/scoreboard";
import Styles from "../../lobby.module.scss";
import { initLobbyGameTransmitter } from "../lobby-game-transmitter";
import { CountdownTimer } from "./countdown-timer";
import { DisabledGameBlock } from "./disable-game-block";
import { GameIcon } from "./game-icon";

const messageEventTypes = {
    SIGNED_IN: "signedIn",
    SHOW_DATA: "showData",
    ROUND_HISTORY: "roundHistory",
    FINISH: "finish",
    END_PLACE_BET: "epb",
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
    const [roundHistory, setRoundHistory] = useState<Round<object, object>[]>([]);
    const [blinkNodeFlag, setBlinkNodeFlag] = useState<boolean>(false);

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
            transmitter.register(messageEventTypes.ROUND_HISTORY, handleRoundHistory);
            transmitter.register(messageEventTypes.FINISH, handleRoundHistory);
            transmitter.register(messageEventTypes.END_PLACE_BET, handleRoundHistory);
        }
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData();
    };

    const handleShowData = ({ showData }: { showData: boolean }) => {
        setIsShow(showData);
    };

    const handleRoundHistory = ({
        roundHistory,
        finish,
        epb,
    }: GameStateContextModel & { finish: Round<object, object>; epb: boolean }): void => {
        console.log({ roundHistory, finish });

        if (roundHistory) {
            setRoundHistory([...roundHistory]);
        }

        if (finish) {
            setRoundHistory((history) => {
                const cloned = [...history];
                cloned.unshift(finish);
                cloned.pop();

                return cloned;
            });
        }

        setBlinkNodeFlag(!!epb);
    };

    const getLobbyData = () => {
        socket.emit("getLobbyData", { gameName: gameSettings.gameName });
    };

    const settlements = roundHistory.map((round) => round.settlementResult);

    blinkNodeFlag && BacBallBigRoadConverter.addBlinkNode(settlements as BacBallSettlementResult[]);

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
                    <div className={Styles.scoreboard}>
                        <SwitchableScoreboard
                            rounds={settlements}
                            type="switch"
                            scoreboards={[
                                {
                                    element: BacBallBigRoadElement,
                                    arrange: BacBallBigRoadElement.arrange(BacBallBigRoadConverter.instance),
                                    column: 12,
                                    row: 6,
                                },
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
