import { TolgeeInstance } from "@tolgee/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { UserStakeLevel } from "../../game-base/type";

export type Props = {
    session: SSOResponse;
    queryGame: number;
    setIsUm: Function;
    directMode: boolean;
    tolgee: TolgeeInstance;
} & WithRouterProps;

type APIErrorProp = {
    message: string;
    errorCode: string;
};

export type State = {
    userStakeLevel: UserStakeLevel;
    authorizeInfo: AuthorizeResponse;
    isShowErrorModal: boolean;
    apiError: APIErrorProp;
    isShowAnnouncement: boolean;
    isBlockUI: boolean;
    queryGame: number;
    isJoinGame: boolean;
    lobbyConfigs: ILobbyConfigs;
    openGameId: number;
    openGameName: string;
    isOnLobby: boolean;
    isLandscapeMode: boolean;
    isUserGesture: boolean;
    dynamicStyle: object;
    isChangedGame: boolean;
    isChangePrevGame: boolean;
};

export type GameOffer = {
    gameId: number;
    maxBet: number;
    minBet: number;
    _id: string;
    maxBetPerChoices: any;
};

export interface ILobbyConfigs {
    name: string;
    currencyGroupIds: string[];
    miniPanelGameIds: number[];
    categories: IGameCategory[];
    banners: IBanner[];
}

export interface IBanner {
    gameId: number;
    displayTime: number;
    path?: string;
}

export interface IGameCategory {
    name: any;
    gameSettings: IGameSetting[];
}

export interface IGameSetting {
    gameId: number;
    bigSize: boolean;
    newTag: boolean;
}
