import {
    SuggestBet,
} from "../../../../components/game-base/type";

export enum PlaceBetEventActionType {
    OWN_BETS = "OWN_BETS",
    DISPLAY_POPUP = "DISPLAY_POPUP",
    ACCEPTED_BET_QUEUE = "ACCEPTED_BET_QUEUE",
    BET_PROCESSING = "BET_PROCESSING",
    END_BET_PROCESSING = "END_BET_PROCESSING",
    SHOW_CONFIRM_BET = "SHOW_CONFIRM_BET",
    NOT_CONFIRM_OWN_BETS = "NOT_CONFIRM_OWN_BETS",
    SUGGEST_BET = "SUGGEST_BET",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE",
    SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
}

export interface PlaceBetEventPayload {
    ownBets?: any;
    endBetData?: {
        endBet?: number;
        betChoice?: any;
        notice?: string;
        kickedOut?: boolean;
        apiError?: boolean;
    };
    acceptedBetQueue?: any;
    suggestBet?: SuggestBet;
    notConfirmOwnBets: object;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
}

export interface PlaceBetEventAction {
    type: PlaceBetEventActionType;
    payload?: PlaceBetEventPayload;
}
