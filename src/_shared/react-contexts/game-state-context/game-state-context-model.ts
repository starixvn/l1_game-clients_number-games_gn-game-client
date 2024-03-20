import {
    GameConfigs,
    IBallColor,
    IUserStakeLevel,
    Notice,
    PFSettingData,
    Round,
    RoundState,
    SuggestBet,
} from "../../../components/game-base/type";

export interface GameStateContextModel {
    tolgeeNamespace: string;
    isConnect: boolean;
    signedIn: boolean;
    roundState: RoundState;
    gameConfigs: GameConfigs;
    roundData: any;
    roundHistory: Round<object, object>[];
    roundId: number;
    result?: any;
    settlementResult?: any;
    totalBets: object;
    ownBets: object;
    betPercentage?: object;
    playerBetCount?: object;
    errorMessage?: string | string[];
    selectedBetChoice?: string;
    isProcessingBet?: boolean;
    disabledMessage?: string;
    showResultInfo: boolean;
    acceptedBetQueue: {
        [key: number]: {
            amount: number;
        };
    };
    showWinningAnimation: boolean;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    notice: Notice;
    activeScoreboardTab?: number;
    rate?: number;
    disconnectReason?: string;
    cageBallFrames: IBallColor;
    isUMInFirstLoad: boolean;
    betWin: number;
    kickedOut: any;
    drawId: number;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
    turnCounter: number;
    notConfirmOwnBets: object;
    userStakeLevel: IUserStakeLevel;
    isShowBetHistory: boolean;
    isShowGameGuide: boolean;
    isShowPFSetting: boolean;
    suggestBet: SuggestBet;
    pfSetting?: PFSettingData;
}

export const initialGameStateContextModel = () => {
    return {
        tolgeeNamespace: "",
        isConnect: false,
        signedIn: false,
        roundState: RoundState.None,
        roundData: {},
        roundHistory: [],
        roundId: 0,
        ownBets: {},
        totalBets: {},
        displayPopup: null,
        betPercentage: {},
        playerBetCount: {},
        showResultInfo: false,
        acceptedBetQueue: {},
        showWinningAnimation: false,
        playResultAnimation: false,
        isShowBlink: false,
        notice: null,
        activeScoreboardTab: 0,
        rate: 0,
        disconnectReason: "",
        gameConfigs: {
            odds: {},
            minBet: 0,
            maxBet: 0,
            maxBetPerChoices: {},
            enableFreeBet: false,
        },
        isUMInFirstLoad: false,
        betWin: 0,
        kickedOut: {},
        drawId: 0,
        result: {},
        settlementResult: {},
        showConfirmBet: false,
        showConfirmDialog: false,
        turnCounter: 0,
        notConfirmOwnBets: {},
        userStakeLevel: {
            minBet: 1,
            maxBet: 200_000,
        },
        isShowBetHistory: false,
        isShowGameGuide: false,
        suggestBet: {
            currentBetChoice: "",
            sendOutstandingBet: null,
            suggestBetAmount: 0,
            isInsufficientFunds: null,
        },
    };
};
