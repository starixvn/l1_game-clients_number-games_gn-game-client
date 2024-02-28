import { GameConfigs, GameDurations, Notice, RoundState } from "../../../components/game-base/type";

export enum GameEventActionType {
    CONNECT = "CONNECT",
    DISCONNECT = "DISCONNECT",
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",
    UM = "UM",
    REMAINING_TIME = "REMAINING_TIME",
    GAME_CONFIGS = "GAME_CONFIGS",
    ROUND_DATA = "ROUND_DATA",
    ROUND_HISTORY = "ROUND_HISTORY",
    FINISH = "FINISH",
    STATUS = "STATUS",
    USER = "USER",
    OWN_BETS = "OWN_BETS",
    BET_PERCENTAGE = "BET_PERCENTAGE",
    PLAYER_BET_COUNT = "PLAYER_BET_COUNT",
    END_BET = "END_BET",
    API_ERROR = "API_ERROR",
    DISCONNECT_ERROR = "DISCONNECT_ERROR",
    USER_STAKE_LEVEL = "USER_STAKE_LEVEL",
    NOTICE_USER_STAKE_LEVEL = "NOTICE_USER_STAKE_LEVEL",
    ODDS = "ODDS",
    DRAW_ID = "DRAW_ID",
    TOTAL_BET = "TOTAL_BET",
    DISPLAY_POPUP = "DISPLAY_POPUP",
    ACCEPTED_BET_QUEUE = "ACCEPTED_BET_QUEUE",
    ROUND_REMAINING_TIME = "ROUND_REMAINING_TIME",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE",
    SHOW_WINNING_ANIMATION = "SHOW_WINNING_ANIMATION",
    BET_PROCESSING = "BET_PROCESSING",
    END_BET_PROCESSING = "END_BBET_PROCESSING",
    ACTIVE_SCORE_BOARD = "ACTIVE_SCORE_BOARD",
    PLAY_RESULT_ANIMATION = "PLAY_RESULT_ANIMATION",
    SHOW_RESULT_INFO_TIME_OUT = "SHOW_RESULT_INFO_TIME_OUT",
    TOGLE_QUICK_BET = "TOGLE_QUICK_BET",
    SHOW_CONFIRM_BET = "SHOW_CONFIRM_BET",
    SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
    NOT_CONFIRM_OWN_BETS = "NOT_CONFIRM_OWN_BETS",
    SET_UM_FIRST_LOADING = "SET_UM_FIRST_LOADING",
}

export interface GameEventPayload {
    signedIn?: boolean;
    isConnect?: boolean;
    remainingTime?: number;
    um?: boolean;
    um_message?: string[];
    gameConfigs?: GameConfigs;
    roundData?: any;
    roundHistory?: any;
    roundId?: number;
    result?: any;
    defaultResult?: any;
    settlementResult?: any;
    defaultSettlementResult?: any;
    durations?: GameDurations;
    status?: {
        win?: boolean;
        bet?: number;
    };
    userData?: {
        user?: any;
        gameConfigs?: any;
    };
    ownBets?: any;
    betPercentage?: {};
    playerBetCount?: {};
    endBetData?: {
        endBet?: number;
        betChoice?: any;
        notice?: string;
        kickedOut?: boolean;
        apiError?: boolean;
    };
    apiError?: any;
    errorCode?: string;
    userStakeLevel?: {
        minBet: number;
        maxBet: number;
    };
    odds?: any;
    drawId?: number;
    totalBets?: any;
    kickedOut?: any;
    notice?: Notice;
    acceptedBetQueue?: any;
    disconnectReason?: string;
    showWinningAnimation?: boolean;
    selectedBetChoice?: string;
    activeScoreboardTab?: Number;
    playResultAnimation?: boolean;
    newGameState?: any;
    showResultInfo?: boolean;
    isShowBlink?: boolean;
    roundState?: RoundState;
    roundRemainingTime?: number;
    showConfirmBet?: boolean;
    showConfirmDialog?: boolean;
    enabledQuickBet?: boolean;
    turnCounter?: number;
    notConfirmOwnBets?: any;
    umFirstLoading?: boolean;
}

export interface GameEventAction {
    type: GameEventActionType;
    payload?: GameEventPayload;
}
