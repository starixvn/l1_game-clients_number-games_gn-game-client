import { WithRouterProps } from "next/dist/client/with-router";
import { Resource, Texture } from "pixi.js";

import { GameEventAction } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { SystemContextModel } from "../../_shared/react-contexts";

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
    BeforeStartRound,
    ConnectFailed,
    SwitchRound,
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

export type GamePropsContext = {
    id?: number;
    gameName?: string;
    socketInfo?: SocketInfo;
    durations?: GameDurations;
    notifyWinStreak?: Function;
    playPlaceBetSound?: Function;
    setApiErrorMessage?: Function;
    userStakeLevel?: UserStakeLevel;
    updateUserStakeLevel?: Function;
    finishJoinGame?: Function;
    isJoinedGame?: boolean;
    dispatch?: (action: GameEventAction) => {};
    gameStateContextModel?: GameStateContextModel<{}, {}>;
    systemContextModel?: SystemContextModel;
    translate?: any;
    hedgeBetGroups?: [];
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
    wholeTurn: number;
    placingBets: number;
    lockingBet: number;
    showResult: number;
    resultAnimation: number;
    beforeStartRound: number;
    switchRoundAnimation: number;
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
    blue2: Texture<Resource>[];
    red2: Texture<Resource>[];
}

export enum BallColor {
    BLUE = "blue",
    RED = "red",
}
