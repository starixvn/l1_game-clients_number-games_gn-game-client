import { TolgeeInstance } from "@tolgee/react";
import { WithRouterProps } from "next/dist/client/with-router";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
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
    lobbyConfigs: any;
    openGameId: number;
    openGameName: string;
    isOnLobby: boolean;
    lobbySocket: Socket;
};

export type GameOffer = {
    gameId: number;
    maxBet: number;
    minBet: number;
    _id: string;
    maxBetPerChoices: any;
};
