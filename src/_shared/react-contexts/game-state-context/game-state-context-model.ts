import { GameConfigs, IBallColor, Notice, Round, RoundState } from "../../../components/game-base/type";

export interface GameStateContextModel<Result, SettlementResult> {
    isConnect: boolean;
    signedIn: boolean;
    roundState: RoundState;
    roundRemainingTime: number;
    remainingTime: number;
    gameConfigs: GameConfigs;
    roundData: any;
    roundHistory: Round<Result, SettlementResult>[];
    roundId: number;
    result?: Result;
    settlementResult?: SettlementResult;
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
    enabledQuickBet: boolean;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
    turnCounter: number;
    notConfirmOwnBets: object;
    userStakeLevel: {
        minBet: number;
        maxBet: number;
    };
    isShowBetHistory: boolean;
}

export const initialGameStateContextModel = ({ defaultResult, defaultSettlementResult }) => {
    return {
        isConnect: false,
        signedIn: false,
        roundState: RoundState.None,
        roundRemainingTime: 0,
        remainingTime: 0,
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
        rate: 1,
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
        result: defaultResult,
        settlementResult: defaultSettlementResult,
        enabledQuickBet: true,
        showConfirmBet: false,
        showConfirmDialog: false,
        turnCounter: 0,
        notConfirmOwnBets: {},
        userStakeLevel: {
            minBet: 1,
            maxBet: 200_000,
        },
        isShowBetHistory: false,
    };
};
