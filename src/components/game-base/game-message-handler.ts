import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";

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
    SOCKET_DISCONNETED: "disconnect",
    ROUND_DATA: "roundData",
    SIGNED_IN: "signedIn",
    NOT_PERMITTED_TO_PLAY: "notPermittedToPlay",
};

export class GameMessageHandler {
    constructor(private dispatch: Function, private messageTransmitter: MessageTransmitterType) {}

    registerSocketEvents = () => {
        this.messageTransmitter.register(messageEventType.GAME_CONFIG, this.handleGameConfigs);
        this.messageTransmitter.register(messageEventType.TOTAL_BETS, this.handleTotalBet);
        this.messageTransmitter.register(messageEventType.OWN_BETS, this.handleOwnBets);
        this.messageTransmitter.register(messageEventType.ODDS, this.handleOdds);
        this.messageTransmitter.register(messageEventType.ROUND_DATA, this.handleRoundData);
        this.messageTransmitter.register(messageEventType.SIGNED_IN, this.handleSignedIn);
    };

    broadcastGameMessage = (message) => {
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
}
