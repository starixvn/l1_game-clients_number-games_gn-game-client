import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";

import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { GameEventActionType } from "../react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";
import { RoundState, SocketInfo } from "./../../components/game-base/type";
import { messageEventType } from "../../components/game-base/game-message-handler";
import { MessageTransmitterType } from "./message-transmitter/type";

export function InitSocketIO(
    socketInfo: SocketInfo,
    session: any,
    dispatch: Function,
    clearDisconnectTimeout: Function,
    gameName: string,
    isUMInFirstLoad: boolean,
    defaultResult: any,
    defaultSettlementResult: any,
    gameStateContextModel: GameStateContextModel<{}, {}>,
    messageTransmitter: MessageTransmitterType
) {
    const { proxy, enableMsgpackParser } = getAppSettings();
    const socketUri = buildServerUrl(socketInfo.namespace);
    const socketOption = {
        forceNew: true,
        transports: ["websocket"],
        path: `${proxy.path}/${socketInfo.path}/socket.io`,
        upgrade: false,
        parser: enableMsgpackParser ? MsgpackParser : undefined,
    };

    const socket = io(socketUri, socketOption);

    const registerMessageHandler = () => {
        messageTransmitter.register(messageEventType.GAME_CONFIG, handleGameConfigs);
        messageTransmitter.register(messageEventType.ROUND_HISTORY, handleRoundHistory);
        messageTransmitter.register(messageEventType.TOTAL_BETS, handleTotalBet);
        messageTransmitter.register(messageEventType.OWN_BETS, handleOwnBets);
        messageTransmitter.register(messageEventType.ODDS, handleOdds);
        messageTransmitter.register(messageEventType.ROUND_DATA, handleRoundData);
    };

    const handleGameConfigs = ({ gameConfigs }) => {
        dispatch({
            type: GameEventActionType.GAME_CONFIGS,
            payload: {
                gameConfigs,
            },
        });
    };

    const handleOwnBets = ({ ownBets }) => {
        dispatch({
            type: GameEventActionType.OWN_BETS,
            payload: {
                ownBets,
            },
        });
    };

    const handleTotalBet = ({ totalBets }) => {
        dispatch({
            type: GameEventActionType.TOTAL_BET,
            payload: {
                totalBets,
            },
        });
    };

    const handleOdds = ({ odds }) => {
        dispatch({
            type: GameEventActionType.ODDS,
            payload: {
                odds,
            },
        });
    };

    const handleSignedIn = () => {
        dispatch({
            type: GameEventActionType.SIGN_IN,
            payload: {
                signedIn: true,
            },
        });

        // clearDisconnectTimeout(); // TO DO : move later
        socket.emit("inGame", gameName);
    };

    const handleRoundHistory = ({ roundHistory, roundId }) => {
        const { roundState } = gameStateContextModel;

        dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                result: roundState === RoundState.LockingBet ? defaultResult : roundHistory[0]?.result,
                settlementResult: roundState === RoundState.LockingBet ? defaultSettlementResult : roundHistory[0]?.settlementResult,
                playResultAnimation: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? false : true,
                showResultInfo: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? true : false,
            },
        });
    };

    const handleRoundData = ({ roundData }) => {
        dispatch({
            type: GameEventActionType.ROUND_DATA,
            payload: {
                roundData,
            },
        });
    };

    if (socket) {
        registerMessageHandler();
        socket.off(gameName).on(gameName, messageTransmitter.broadcast);
        socket.on("connect", () => {
            messageTransmitter.broadcast({ connect: true });
            socket.emit("signin", session);
            dispatch({
                type: GameEventActionType.CONNECT,
                payload: {
                    isConnect: true,
                },
            });
        });

        socket.on("signedIn", () => {
            messageTransmitter.broadcast({ signedIn: true });
            handleSignedIn();
        });

        socket.on("connect_error", () => {
            messageTransmitter.broadcast({ connect_error: true });
            messageTransmitter.clearAllListener();
        });
        socket.on("disconnect", () => {
            messageTransmitter.broadcast({ disconnect: true });
            dispatch({
                type: GameEventActionType.DISCONNECT,
                payload: {},
            });
        });
    }

    return { socket };
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
