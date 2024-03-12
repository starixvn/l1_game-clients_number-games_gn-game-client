import { WithRouterProps } from "next/dist/client/with-router";
import { Resource, Texture } from "pixi.js";

import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { SystemContextModel, SystemEventAction } from "../../_shared/react-contexts";
import { GameEventAction } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameMessageHandler } from "./handlers/game-message-handler";

export interface GameConfigs {
    odds: { [key: string]: number };
    minBet: number;
    maxBet: number;
    maxBetPerChoices: any;
    enableFreeBet: boolean;
    chips: string[];
}

export enum RoundState {
    None,
    Disabled,
    InRound,
    LockingBet,
    DisplayResult,
    BeforePlaceBet,
    ConnectFailed,
    SwitchRound,
}

export interface GameSettings {
    id: number;
    gameName: string;
    socketInfo: SocketInfo;
    durations: GameDurations;
    totalTurns: number;
}

export type GamePropsContext = {
    id?: number;
    gameName?: string;
    socketInfo?: SocketInfo;
    durations?: GameDurations;
    totalTurns?: number;
    notifyWinStreak?: Function;
    setApiErrorMessage?: Function;
    userStakeLevel?: UserStakeLevel;
    updateUserStakeLevel?: Function;
    finishJoinGame?: Function;
    isJoinedGame?: boolean;
    dispatch?: (action: GameEventAction) => {};
    gameStateContextModel?: GameStateContextModel<{}, {}>;
    systemContextModel?: SystemContextModel;
    systemDispatch?: (action: SystemEventAction) => {};
    translate?: TFnType<DefaultParamType, string, TranslationKey>;
    hedgeBetGroups?: [string[]];
    gameMessageHandler?: GameMessageHandler;
    gameSound?: GameSound;
};

export type GameSound = {
    playPlaceBetSound: Function;
    startRoundSound: Function;
    receiveFinishSound: Function;
    startBettingSound: Function;
    stopBettingSound: Function;
};

export type GameBaseProps = GamePropsContext & WithRouterProps;

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
    onClose?: () => void;
    hedgeBetGroup?: string[];
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
    wholeRound: number;
    wholeTurn?: number;
    placingBets: number;
    lockingBet: number;
    showResult: number;
    resultAnimation: number;
    beforePlaceBet: number;
    switchRoundAnimation?: number;
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

export interface Round<R, S> {
    roundId: number;
    result: R;
    settlementResult: S;
}

export interface IBallColor {
    blue: Texture<Resource>[];
    red: Texture<Resource>[];
    blue2: Texture<Resource>[];
    red2: Texture<Resource>[];
}

export enum BallColor {
    BLUE = "blue",
    RED = "red",
}

export type SuggestBet = {
    currentBetChoice?: string;
    suggestBetAmount?: number;
    sendOutstandingBet?: Function;
    isInsufficientFunds?: boolean;
};
