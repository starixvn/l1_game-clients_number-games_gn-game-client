import {
    DrawInfo,
    GameConfigs,
    GameDurations,
    Notice,
    PFClientSeedSetting,
    PFResult,
    RoundState,
    SuggestBet,
} from "../../../components/game-base/type";

export enum GameEventActionType {
    CONNECT = "CONNECT",
    DISCONNECT = "DISCONNECT",
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",
    UM = "UM",
    GAME_CONFIGS = "GAME_CONFIGS",
    ROUND_DATA = "ROUND_DATA",
    ROUND_HISTORY = "ROUND_HISTORY",
    FINISH = "FINISH",
    WIN_STATUS = "WIN_STATUS",
    USER = "USER",
    API_ERROR = "API_ERROR",
    DISCONNECT_ERROR = "DISCONNECT_ERROR",
    USER_STAKE_LEVEL = "USER_STAKE_LEVEL",
    NOTICE_USER_STAKE_LEVEL = "NOTICE_USER_STAKE_LEVEL",
    ODDS = "ODDS",
    DRAW_ID = "DRAW_ID",
    TURN_COUNTER = "TURN_COUNTER",
    DISPLAY_POPUP = "DISPLAY_POPUP",
    ROUND_REMAINING_TIME = "ROUND_REMAINING_TIME",
    SET_NEW_GAME_STATE = "SET_NEW_GAME_STATE",
    SHOW_WINNING_ANIMATION = "SHOW_WINNING_ANIMATION",
    ACTIVE_SCORE_BOARD = "ACTIVE_SCORE_BOARD",
    PLAY_RESULT_ANIMATION = "PLAY_RESULT_ANIMATION",
    SHOW_RESULT_INFO_TIME_OUT = "SHOW_RESULT_INFO_TIME_OUT",
    SHOW_CONFIRM_DIALOG = "SHOW_CONFIRM_DIALOG",
    SET_UM_FIRST_LOADING = "SET_UM_FIRST_LOADING",
    TOGGLE_BET_HISTORY = "TOGGLE_BET_HISTORY",
    TOGGLE_BET_DETAIL = "TOGGLE_BET_DETAIL",
    UPDATE_BET_DETAIL = "UPDATE_BET_DETAIL",
    TOGGLE_PF_VERIFY = "TOGGLE_PF_VERIFY",
    UPDATE_PF_VERIFY = "UPDATE_PF_VERIFY",
    TOGGLE_PF_CLIENT_SEED_INFO = "TOGGLE_PF_CLIENT_SEED_INFO",
    TOGGLE_PF_VERIFICATION = "TOGGLE_PF_VERIFICATION",
    TOGGLE_GAME_GUIDE = "TOGGLE_GAME_GUIDE",
    TOGGLE_PF_SETTING = "TOGGLE_PF_SETTING",
    UPDATE_PF_CLIENT_SEED_SETTING = "UPDATE_PF_CLIENT_SEED_SETTING",
    START_NEW_ROUND_ANIM = "START_NEW_ROUND_ANIM",
}

export interface GameEventPayload {
    signedIn?: boolean;
    isConnect?: boolean;
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
    rate?: number;
    apiError?: any;
    errorCode?: string;
    userStakeLevel?: {
        minBet: number;
        maxBet: number;
    };
    odds?: any;
    drawId?: number;
    kickedOut?: any;
    notice?: Notice;
    disconnectReason?: string;
    showWinningAnimation?: boolean;
    selectedBetChoice?: string;
    activeScoreboardTab?: number;
    playResultAnimation?: boolean;
    newGameState?: any;
    showResultInfo?: boolean;
    isShowBlink?: boolean;
    roundState?: RoundState;
    showConfirmBet?: boolean;
    showConfirmDialog?: boolean;
    turnCounter?: number;
    notConfirmOwnBets?: any;
    isUMInFirstLoad?: boolean;
    isShowBetHistory?: boolean;
    isShowGameGuide?: boolean;
    isShowPFSetting?: boolean;
    isShowBetDetail?: boolean;
    isShowPFVerify?: boolean;
    isShowPFClientSeedInfo?: boolean;
    isShowPFVerification?: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    betDetailModalData?: {
        drawInfo: DrawInfo;
        betLogDetails: any[];
    };
    pfVerifyModalData?: PFResult;
    isPlayStartRoundAnimation?: boolean;
}

export interface GameEventAction {
    type: GameEventActionType;
    payload?: GameEventPayload;
}
