import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { GameEventActionType } from "../react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";
import { RoundState, SocketInfo } from "./../../components/game-base/type";
import MessageTransmitter from "./message-transmitter";

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

        messageTransmitter.register("gameConfigs", handleGameConfigs);
        messageTransmitter.register("roundHistory", handleRoundHistory);
        messageTransmitter.register("totalBets", handleTotalBet);
        messageTransmitter.register("ownBets", handleOwnBets);
        messageTransmitter.register("odds", handleOdds);

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
        const { gameState } = gameStateContextModel;

        dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult, RoundState.BalancingBet].includes(gameState) || isUMInFirstLoad ? roundId - 1 : roundId,
                result: gameState === RoundState.LockingBet ? defaultResult : roundHistory[0]?.result,
                settlementResult: gameState === RoundState.LockingBet ? defaultSettlementResult : roundHistory[0]?.settlementResult,
                playResultAnimation: [RoundState.DisplayResult].includes(gameState) || isUMInFirstLoad ? false : true,
                showResultInfo: [RoundState.DisplayResult].includes(gameState) || isUMInFirstLoad ? true : false,
            },
        });
    };

    if (socket) {
        socket.off(gameName).on(gameName, messageTransmitter.broadcast);
        socket.on("connect", () => {
            registerMessageHandler();
            socket.emit("signin", session);
            dispatch({
                type: GameEventActionType.CONNECT,
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
                type: GameEventActionType.DISCONNECT,
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
