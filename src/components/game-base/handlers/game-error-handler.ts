import { GetLocalizedErrorMessage, isKickOutError } from "../../../_shared/helpers";
import { GlobalMessageTransmitter } from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameMessageHandler, messageEventType } from "./game-message-handler";

export type GameErrorHandlerProps = {
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
    gamName: string;
};

export interface ApiError {
    errorCode: string;
    hedgeBetGroup?: string[];
    minBet?: number;
    maxBet?: number;
    gameRoundId?: number;
    gameTypeId?: number;
    isPlaceBetFailed?: boolean;
}

export class GameErrorHandler {
    constructor(private readonly props: GameErrorHandlerProps) { }

    registerEvents = (signOut: Function) => {
        this.props.gameMessageHandler.register(messageEventType.API_ERROR, ({ apiError }) => {
            this.handleApiError(apiError, signOut);
        });
    };

    handleApiError = (apiError: ApiError, signOut: Function) => {
        const isPlaceBet = apiError.isPlaceBetFailed ? apiError.isPlaceBetFailed : false;
        const errorCode = apiError.errorCode;
        const isKickOut = isKickOutError(errorCode);
        const onClose = isKickOut ? signOut : null;
        const message = GetLocalizedErrorMessage(errorCode, isPlaceBet);

        GlobalMessageTransmitter.broadcast({ notice: {
            gameName: this.props.gamName,
            roundId: apiError?.gameRoundId,
            message: message,
                    duration: isKickOut ? 10 : 3,
            minBet: apiError?.minBet,
            maxBet: apiError?.maxBet,
            errorCode: errorCode,
            onClose,
        } });
    };
}
