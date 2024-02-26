import { WithTranslation } from "next-i18next";
import { WithRouterProps } from "next/dist/client/with-router";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { UserStakeLevel } from "../../game-base/type";

export type Props = {
    session: SSOResponse;
    queryGame: number;
    setIsUm: Function;
    directMode: boolean;
} & WithRouterProps &
    WithTranslation;

type APIErrorProp = {
    message: string;
    errorCode: string;
};

export type State = {
    enabledWinningStreakNotification: boolean;
    enabledPlaySound: boolean;
    userStakeLevel: UserStakeLevel;
    authorizeInfo: AuthorizeResponse;
    isShowErrorModal: boolean;
    apiError: APIErrorProp;
    isShowHistory: boolean;
    isShowAnnouncement: boolean;
    isShowGuide: boolean;
    favoriteGames: number[];
    enabledQuickBet: boolean;
    betValue: number;
    isBlockUI: boolean;
    queryGame: number;
    isJoinGame: boolean;
    settingGames: number[];
    openGameId: number;
    openGameName: string;
    isShowToolbarGuide: boolean;
};

export type GameOffer = {
    gameId: number;
    maxBet: number;
    minBet: number;
    _id: string;
    maxBetPerChoices: any;
};
