import { WithTranslation } from "next-i18next";
import { WithRouterProps } from "next/dist/client/with-router";
import { Socket } from "socket.io-client";

import { SocketState } from "../../_shared/helpers";
import { Resource, Texture } from "pixi.js";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";

export interface GameConfigs {
    odds: { [key: string]: number };
    minBet: number;
    maxBet: number;
    maxBetPerChoices: any;
    enableFreeBet: boolean;
}

export enum GameState {
    None,
    Disabled,
    InRound,
    LockingBet,
    DisplayResult,
    BeforeStartRound,
    BalancingBet,
    ConnectFailed,
}
export enum PopupType {
    Rebet,
    Error,
    PlaceBet,
}

export interface GameSettings {
    id: number;
    gameName: string;
    socketInfo: SocketInfo;
    durations: GameDurations;
}

export type GameBaseProps = {
    id: number;
    gameName: string;
    socketInfo: SocketInfo;
    durations: GameDurations;
    notifyWinStreak: Function;
    playPlaceBetSound: Function;
    viewMode: ViewMode;
    setApiErrorMessage: Function;
    supportMD5?: boolean;
    userStakeLevel: UserStakeLevel;
    updateUserStakeLevel: Function;
    registerGlobalMessageEvent: Function;
    unsubscribeGlobalMessageEvent: Function;
    finishJoinGame: Function;
    isJoinedGame: boolean;
    dispatch: Function;
    gameStateContextModel: GameStateContextModel<{}, {}>;
    determineGameState: Function;
    getTimeCounter: Function;
    getStateByNextGameState: Function;
} & WithRouterProps;
export interface GameBaseState<Result, SettlementResult> {
    signedIn: boolean;
    gameState: GameState;
    roundRemainingTime: number;
    remainingTime: number;
    gameConfigs: GameConfigs;
    roundHistory: Round<Result, SettlementResult>[];
    roundId: number;
    drawId: number;
    result?: Result;
    settlementResult?: SettlementResult;
    ownBets: object;
    displayPopup?: PopupType;
    errorMessage?: string | string[];
    selectedBetChoice?: string;
    isProcessingBet?: boolean;
    viewMode: ViewMode;
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
    rate: number;
    disconnectReason?: string;
}

export interface Notice {
    gameName?: string;
    roundId?: number;
    message: string;
    duration?: number;
    minBet?: number;
    maxBet?: number;
    errorCode?: string;
    position?: any;
    isWarning?: boolean;
    betChoice1?: string;
    betChoice2?: string;
}

export interface APIError extends Notice {
    gameName?: string;
    roundId?: number;
}

export interface SocketInfo {
    namespace: string;
    path: string;
}

export interface GameDurations {
    wholeTurn: number;
    placingBets: number;
    lockingBet: number;
    showResult: number;
    resultAnimation: number;
    beforeStartRound: number;
}

export interface RebetStorageModel {
    [gameId: string]: RebetStorageDetail;
}

export interface RebetStorageDetail {
    roundId: number;
    betInfo: object;
}

export interface UserStakeLevel {
    minBet: number;
    maxBet: number;
}

export type GameGuide = {
    gameConfigs: GameConfigs;
    userStakeLevel: UserStakeLevel;
    gameName: string;
    gameId?: number;
};

export interface BetLogsBase<Result, SettlementResult, Odd> {
    betLogDetails?: [];
    betwin?: number;
    freeBet?: boolean;
    name?: string;
    phien?: number;
    result?: Result;
    settlementResult?: SettlementResult;
    time?: string;
    odds?: Odd;
}

export interface WinStreakCollectorModel {
    [key: string]: {
        streak: number;
        isStopStreak: boolean;
    };
}
export enum ViewMode {
    full,
    collapse,
}

export interface Position {
    x: number;
    y: number;
}

export interface Boundary {
    left: number;
    right: number;
}

export interface Round<R, S> {
    roundId: number;
    result: R;
    settlementResult: S;
}

export interface IBallColor {
    blue: Texture<Resource>[];
    red: Texture<Resource>[];
}
