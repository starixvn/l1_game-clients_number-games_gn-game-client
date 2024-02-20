import { Resource, Texture } from "pixi.js";
import {
    Boundary,
    GameConfigs,
    RoundState,
    IBallColor,
    Notice,
    PopupType,
    Position,
    Round,
    ViewMode,
} from "../../../components/game-base/type";
import { MessageTransmitterType } from "../../helpers/message-transmitter/type";

export interface GameStateContextModel<Result, SettlementResult> {
    isConnect: boolean;
    signedIn: boolean;
    gameState: RoundState;
    roundRemainingTime: number;
    remainingTime: number;
    gameConfigs: GameConfigs;
    roundHistory: Round<Result, SettlementResult>[];
    roundId: number;
    result?: Result;
    settlementResult?: SettlementResult;
    totalBets: object;
    ownBets: object;
    displayPopup?: PopupType;
    betPercentage?: object;
    errorMessage?: string | string[];
    selectedBetChoice?: string;
    isProcessingBet?: boolean;
    disabledMessage?: string;
    showResultInfo: boolean;
    acceptedBetQueue: {
        [key: number]: {
            amount: number;
            betPosition: Position;
            betOptionBoundary: Boundary;
        };
    };
    showWinningAnimation: boolean;
    playResultAnimation: boolean;
    isShowBlink: boolean;
    notice: Notice;
    removeBetChoiceFocus?: Function;
    betOptionElement?: HTMLElement;
    betChoiceElement?: HTMLElement;
    activeScoreboardTab?: number;
    rate?: number;
    disconnectReason?: string;
    winningPlayerFrames: Texture<Resource>[];
    winningTieFrames: Texture<Resource>[];
    cageBallsLoopFrames: Texture<Resource>[];
    cageBallFrames: IBallColor;
    isUMInFirstLoad: boolean;
    betWin: number;
    kickedOut: any;
    drawId: number;
    viewMode: ViewMode;
    messageTransmitter: MessageTransmitterType;
    enabledQuickBet: boolean;
    selectedChip: number;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
    turnCounter: number;
}

export const initialGameStateContextModel = ({ defaultResult, defaultSettlementResult }) => {
    return {
        isConnect: false,
        signedIn: false,
        gameState: RoundState.None,
        roundRemainingTime: 0,
        remainingTime: 0,
        roundHistory: [],
        roundId: 0,
        ownBets: {},
        totalBets: {},
        displayPopup: null,
        betPercentage: {},
        showResultInfo: false,
        acceptedBetQueue: {},
        showWinningAnimation: false,
        playResultAnimation: false,
        isShowBlink: false,
        notice: null,
        removeBetChoiceFocus: null,
        betOptionElement: null,
        betChoiceElement: null,
        activeScoreboardTab: 0,
        rate: 1,
        disconnectReason: "",
        winningPlayerFrames: [],
        winningTieFrames: [],
        cageBallsLoopFrames: [],
        cageBallFrames: { blue: [], red: [] },
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
        viewMode: ViewMode.full,
        messageTransmitter: undefined,
        result: defaultResult,
        settlementResult: defaultSettlementResult,
        enabledQuickBet: true,
        selectedChip: 1,
        showConfirmBet: false,
        showConfirmDialog: false,
        turnCounter: 1,
    };
};
