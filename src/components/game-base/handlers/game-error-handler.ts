import { GetLocalizedErrorMessage } from "../../../_shared/helpers";
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
    constructor(private props: GameErrorHandlerProps) {}

    registerEvents = (signOut: Function) => {
        this.props.gameMessageHandler.register(messageEventType.API_ERROR, ({ apiError }) => {
            this.handleApiError(apiError, signOut);
        });
    };

    handleApiError = (apiError: ApiError, signOut: Function) => {
        const isPlaceBet = apiError.isPlaceBetFailed ? apiError.isPlaceBetFailed : false;
        const errorCode = apiError.errorCode;
        const isKickOutError = this.isKickOutError(errorCode.toString());
        const onClose = isKickOutError ? signOut : null;
        const message = GetLocalizedErrorMessage(errorCode, isPlaceBet);

        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice: {
                    gameName: this.props.gamName,
                    roundId: apiError?.gameRoundId,
                    message: message,
                    duration: isKickOutError ? 10 : 3,
                    minBet: apiError?.minBet,
                    maxBet: apiError?.maxBet,
                    errorCode: errorCode,
                    onClose,
                },
            },
        });
    };

    isKickOutError = (errorCode: string) => {
        return errorCode === "1001" || errorCode === "1002";
    };
}
