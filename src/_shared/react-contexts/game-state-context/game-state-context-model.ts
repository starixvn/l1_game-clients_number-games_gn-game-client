import {
    DrawInfo,
    GameConfigs,
    IUserStakeLevel,
    Notice,
    PFClientSeedSetting,
    PFResult,
    Round,
    RoundState,
} from "../../../components/game-base/type";

export interface GameStateContextModel {
    isConnect: boolean;
    signedIn: boolean;
    roundState: RoundState;
    gameConfigs: GameConfigs;
    roundData: any;
    roundHistory: Round<object, object>[];
    roundId: number;
    result?: any;
    settlementResult?: any;
    errorMessage?: string | string[];
    selectedBetChoice?: string;
    isProcessingBet?: boolean;
    disabledMessage?: string;
    showResultInfo: boolean;
    showWinningAnimation: boolean;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    notice: Notice;
    activeScoreboardTab?: number;
    rate?: number;
    disconnectReason?: string;
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
    isShowBetDetail: boolean;
    isShowGameGuide: boolean;
    isShowPFSetting: boolean;
    isShowPFVerify: boolean;
    isShowPFClientSeedInfo: boolean;
    isShowPFVerification: boolean;
    pfClientSeedSetting?: PFClientSeedSetting;
    betDetailModalData?: {
        drawInfo: DrawInfo;
        betLogDetails: any[];
    };
    pfVerifyModalData?: PFResult;
    isPlayStartRoundAnimation?: boolean;
}

export const initialGameStateContextModel = () => {
    return {
        isConnect: false,
        signedIn: false,
        roundState: RoundState.None,
        roundData: {},
        roundHistory: [],
        roundId: 0,
        displayPopup: null,
        showResultInfo: false,
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
        pfClientSeedSetting: {
            drawId: 0,
            randomClientSeed: "0000",
            manualClientSeed: "",
            useManualClientSeed: false,
        },
        isPlayStartRoundAnimation: false,
    };
};
