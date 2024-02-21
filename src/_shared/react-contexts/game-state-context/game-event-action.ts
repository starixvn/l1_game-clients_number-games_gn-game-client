import { GameConfigs, GameDurations, RoundState, PopupType, ViewMode } from "../../../components/game-base/type";

export enum GameEventActionType {
    CONNECT = "CONNECT",
    CONNECT_ERROR = "CONNECT_ERROR",
    SIGN_IN = "SIGN_IN",
    DISCONNECT = "DISCONNECT",
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
    END_BET = "END_BET",
    API_ERROR = "API_ERROR",
    ERROR_CODE = "ERROR_CODE",
    USER_STAKE_LEVEL = "USER_STAKE_LEVEL",
    ODDS = "ODDS",
    DRAW_ID = "DRAW_ID",
    TOTAL_BET = "TOTAL_BET",
    KICK_OUT = "KICK_OUT",
    DISPLAY_POPUP = "DISPLAY_POPUP",
    ACCEPTED_BET_QUEUE = "ACCEPTED_BET_QUEUE",
    ROUND_REMAINING_TIME = "ROUND_REMAINING_TIME",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE",
    SHOW_WINNING_ANIMATION = "SHOW_WINNING_ANIMATION",
    PLACE_BET_POPUP = "PLACE_BET_POPUP",
    BET_PROCESSING = "BET_PROCESSING",
    OPEN_POPUP = "OPEN_POPUP",
    VIEW_MODE = "VIEW_MODE",
    ACTIVE_SCORE_BOARD = "ACTIVE_SCORE_BOARD",
    PLAY_RESULT_ANIMATION = "PLAY_RESULT_ANIMATION",
    SHOW_RESULT_INFO_TIME_OUT = "SHOW_RESULT_INFO_TIME_OUT",
    TOGLE_QUICK_BET = "TOGLE_QUICK_BET",
    SET_SELECT_CHIP = "SET_SELECT_CHIP",
    SHOW_CONFIRM_BET = "SHOW_CONFIRM_BET",
    SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
}

export interface GameEventPayload {
    signedIn?: boolean;
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
    ownBetsData?: {
        ownBets?: any;
        gameConfigs?: any;
    };
    betPercentage?: number;
    endBetData?: {
        endBet?: number;
        betChoice?: any;
        notice?: string;
        kickedOut?: boolean;
        apiError?: boolean;
    };
    apiError?: any;
    errorCode?: string;
    userStakeLevel?: any;
    odds?: any;
    drawId?: number;
    totalBets?: any;
    kickedOut?: any;
    notice?: any;
    acceptedBetQueue?: any;
    disconnectReason?: string;
    showWinningAnimation?: boolean;
    selectedBetChoice?: string;
    removeBetChoiceFocus?: Function;
    betOptionElement?: HTMLElement;
    betChoiceElement?: HTMLElement;
    displayPopup?: PopupType;
    viewMode?: ViewMode;
    activeScoreboardTab?: Number;
    playResultAnimation?: boolean;
    newGameState?: any;
    showResultInfo?: boolean;
    isShowBlink?: boolean;
    roundState?: RoundState;
    roundRemainingTime?: number;
    selectedChip?: number;
    showConfirmBet?: boolean;
    showConfirmDialog?: boolean;
    enabledQuickBet?: boolean;
    turnCounter?: number;
}

export interface GameEventAction {
    type: GameEventActionType;
    payload?: GameEventPayload;
}
