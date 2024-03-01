import MessageTransmitter from "../../../_shared/helpers/message-transmitter";
import { MessageTransmitterType } from "../../../_shared/helpers/message-transmitter/type";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

export const messageEventType = {
    GAME_CONFIG: "gameConfigs",
    ROUND_HISTORY: "roundHistory",
    REMAINING_TIME: "remainingTime",
    FINISH: "finish",
    STATUS: "status",
    USER: "user",
    OWN_BETS: "ownBets",
    END_BET: "endBet",
    API_ERROR: "apiError",
    ERROR_CODE: "errorCode",
    USER_STAKE_LEVEL: "userStakeLevel",
    TOTAL_BETS: "totalBets",
    ODDS: "odds",
    UNDER_MAINTENANCE: "um",
    DRAW_ID: "drawId",
    SOCKET_CONNECT_ERROR: "connect_error",
    SOCKET_CONNECTED: "connect",
    SOCKET_DISCONNECTED: "disconnect",
    ROUND_DATA: "roundData",
    SIGNED_IN: "signedIn",
    NOT_PERMITTED_TO_PLAY: "notPermittedToPlay",
    BET_PERCENTAGE: "betPercentage",
    PLAYER_BET_COUNT: "playerBetCount",
    GAME_DESTROY: "gameDestroy",
    SEND_SOCKET_MESSAGE: "sendSocketMessage",
    TOGGLE_BETHISTORY: "toggleBetHistory",
    BET_HISTORY: "history",
    UPDATE_PLAYER_BALANCE: "updatePlayerBalance",
    CLEAR_GAME_TIMEOUT_AND_INTERVAL: "clearGameTimeoutAndInterval",
};

export class GameMessageHandler {
    constructor(private dispatch: Function, private messageTransmitter?: MessageTransmitterType) {
        this.messageTransmitter = messageTransmitter ?? MessageTransmitter();
    }

    registerSocketEvents = () => {
        this.register(messageEventType.DRAW_ID, this.handleDrawId);
        this.register(messageEventType.GAME_CONFIG, this.handleGameConfigs);
        this.register(messageEventType.TOTAL_BETS, this.handleTotalBet);
        this.register(messageEventType.OWN_BETS, this.handleOwnBets);
        this.register(messageEventType.ODDS, this.handleOdds);
        this.register(messageEventType.ROUND_DATA, this.handleRoundData);
        this.register(messageEventType.SIGNED_IN, this.handleSignedIn);
        this.register(messageEventType.BET_PERCENTAGE, this.handleBetPercentage);
        this.register(messageEventType.PLAYER_BET_COUNT, this.handlePlayerBetCount);
    };

    getMessageTransmitter() {
        return this.messageTransmitter;
    }

    register = (eventType: string, handler: Function) => {
        this.messageTransmitter.register(eventType, handler);
    };

    broadcastGameMessage = (message) => {
        if (message[messageEventType.USER_STAKE_LEVEL]) {
            this.messageTransmitter.broadcast({ ...message, hasNotice: false });
        } else {
            this.messageTransmitter.broadcast(message);
        }
    };

    broadcastGameEvent = (message) => {
        this.messageTransmitter.broadcast(message);
    };

    handleGameConfigs = ({ gameConfigs }) => {
        this.dispatch({
            type: GameEventActionType.GAME_CONFIGS,
            payload: {
                gameConfigs,
            },
        });
    };

    handleOwnBets = ({ ownBets }) => {
        this.dispatch({
            type: GameEventActionType.OWN_BETS,
            payload: {
                ownBets,
            },
        });
    };

    handleTotalBet = ({ totalBets }) => {
        this.dispatch({
            type: GameEventActionType.TOTAL_BET,
            payload: {
                totalBets,
            },
        });
    };

    handleOdds = ({ odds }) => {
        this.dispatch({
            type: GameEventActionType.ODDS,
            payload: {
                odds,
            },
        });
    };

    handleSignedIn = () => {
        this.dispatch({
            type: GameEventActionType.SIGN_IN,
            payload: {},
        });
    };

    handleRoundData = ({ roundData }) => {
        this.dispatch({
            type: GameEventActionType.ROUND_DATA,
            payload: {
                roundData,
            },
        });
    };

    handleBetPercentage = ({ betPercentage }) => {
        this.dispatch({
            type: GameEventActionType.BET_PERCENTAGE,
            payload: {
                betPercentage,
            },
        });
    };

    handlePlayerBetCount = ({ playerBetCount }) => {
        this.dispatch({
            type: GameEventActionType.PLAYER_BET_COUNT,
            payload: {
                playerBetCount,
            },
        });
    };

    handleDrawId = ({ drawId }) => {
        const numberOfTurnsPerRound = 4;
        const turnCounter = drawId % numberOfTurnsPerRound === 0 ? numberOfTurnsPerRound : drawId % numberOfTurnsPerRound;

        this.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId, turnCounter },
        });
    };

    clearAllHandlers = () => {
        this.messageTransmitter.clearAllListener();
    };
}
