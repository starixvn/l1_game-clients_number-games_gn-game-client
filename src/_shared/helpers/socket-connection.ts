import { GameState, SocketInfo } from "./../../components/game-base/type";
import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { ConnectFailedReasonKey } from "../../components/game-components/error-message/type";
import { SocketEventActionTypes } from "../react-contexts/game-state-context/socket-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../react-contexts/game-state-context/game-state-context";
import { MessageTransmitterType } from "./message-transmitter/type";
import MessageTransmitter from "./message-transmitter";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";

export function InitSocketIO(
    socketInfo: SocketInfo,
    session: any,
    dispatch: Function,
    clearDisconnectTimeout: Function,
    gameName: string,
    isUMInFirstLoad: boolean,
    defaultResult: any,
    defaultSettlementResult: any,
    gameStateContextModel: GameStateContextModel<{}, {}>
) {
    const { proxy, enableMsgpackParser } = getAppSettings();
    // const dispatch = useGameStatesDispatch();
    // const gameStateContextModel = useGameStateContext();

    const messageTransmitter = MessageTransmitter();

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
        messageTransmitter.register("signedIn", ({ signedIn }) => {
            signedIn && handleSignedIn();
        });

        // this.messageTransmitter.register("um", this.handleUM.bind(this));
        // this.messageTransmitter.register("remainingTime", this.handleRemainingTime.bind(this));

        messageTransmitter.register("gameConfigs", () => {
            handleGameConfigs;
        });

        messageTransmitter.register("roundHistory", () => {
            handleRoundHistory;
        });

        // this.messageTransmitter.register("finish", this.handleFinish.bind(this));
        // this.messageTransmitter.register("status", this.handleStatus.bind(this));
        // this.messageTransmitter.register("user", this.handleUserData.bind(this));
        // this.messageTransmitter.register("ownBets", this.handleOwnBets.bind(this));
        // this.messageTransmitter.register("endBet", this.handleEndBet.bind(this));
        // this.messageTransmitter.register("apiError", this.handleApiError.bind(this));
        // this.messageTransmitter.register("errorCode", this.handleError.bind(this));
        // this.messageTransmitter.register("userStakeLevel", this.handleUserStakeLevel.bind(this));
        // this.messageTransmitter.register("drawId", this.handleDrawId.bind(this));
    };

    const handleGameConfigs = ({ gameConfigs }) => {
        dispatch({
            type: SocketEventActionTypes.GAME_CONFIGS,
            payload: {
                gameConfigs,
            },
        });
    };

    const handleSignedIn = () => {
        dispatch({
            type: SocketEventActionTypes.SIGN_IN,
            payload: {
                signedIn: true,
            },
        });

        // clearDisconnectTimeout(); // TO DO : move later
        socket.emit("inGame", gameName);
    };

    const handleRoundHistory = ({ roundHistory, roundId }) => {
        const { gameState } = gameStateContextModel;

        dispatch({
            type: SocketEventActionTypes.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [GameState.DisplayResult, GameState.BalancingBet].includes(gameState) || isUMInFirstLoad ? roundId - 1 : roundId,
                result: gameState === GameState.LockingBet ? defaultResult : roundHistory[0]?.result,
                settlementResult: gameState === GameState.LockingBet ? defaultSettlementResult : roundHistory[0]?.settlementResult,
                playResultAnimation: [GameState.DisplayResult].includes(gameState) || isUMInFirstLoad ? false : true,
                showResultInfo: [GameState.DisplayResult].includes(gameState) || isUMInFirstLoad ? true : false,
            },
        });
    };

    if (socket) {
        socket.off(gameName).on(gameName, messageTransmitter.broadcast);
        socket.on("connect", () => {
            registerMessageHandler();
            socket.emit("signin", session);
            dispatch({
                type: SocketEventActionTypes.CONNECT,
                payload: {
                    isConnect: true,
                },
            });
        });

        socket.on("signedIn", () => handleSignedIn());

        socket.on("connect_error", () => {
            messageTransmitter.clearAllListener();
            // this.onConnectFailed.bind(this);
        });
        socket.on("disconnect", () => {
            messageTransmitter.clearAllListener();
            dispatch({
                type: SocketEventActionTypes.DISCONNECT,
                payload: {},
            });
        });
    }

    return { socket, messageTransmitter };
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
