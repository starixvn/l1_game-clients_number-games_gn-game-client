import * as Sentry from "@sentry/nextjs";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { GameSettings } from "../../components/game-base/type";
import { IBanner, ILobbyConfigs } from "../../components/page-components/dashboard/type";
import { getAppSettings } from "../app-settings";
import { buildUrlWithPath } from "./url-helper";

export const getBanners = (lobbyConfigs: ILobbyConfigs): IBanner[] => {
    return lobbyConfigs?.banners;
};

export const getOfferGamesIds = (authorizeInfo: AuthorizeResponse): number[] => {
    return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
};

export const getLobbyGameIds = (lobbyConfigs: ILobbyConfigs): number[] => {
    return lobbyConfigs?.categories?.[0]?.gameSettings?.map((setting) => setting.gameId);
};

export const getBannerIds = (lobbyConfigs: ILobbyConfigs) => {
    const banners = lobbyConfigs?.banners;

    return banners?.map((banner) => banner.gameId) ?? [];
};

export const getLobbyGamesIds = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    return getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
};

export const getRenderGameSettings = (lobbyConfigs: ILobbyConfigs, offerGamesIds: number[]) => {
    if (lobbyConfigs && offerGamesIds) {
        const { gameSettings: allGamesSettings } = getAppSettings();
        const lobbyGameIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
        return lobbyGameIds?.map((gameId) => allGamesSettings[gameId]).filter((settings) => settings && !settings.isComingSoon);
    }
    return [];
};

export const getEnabledRenderGameSettings = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse): GameSettings[] => {
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs, authorizeInfo);
    if (gameOfferIds?.length > 0) {
        const renderGameSetting = getRenderGameSettings(lobbyConfigs, gameOfferIds);
        const enabledGames = authorizeInfo.user.enabledGameIds;
        return renderGameSetting.filter((gameSetting) => enabledGames.find((gameId) => gameId === gameSetting.id));
    }
    return [];
};

export const getServiceStatusIsAvailable = async (gameSetting: GameSettings) => {
    let statusCode = 0;
    const { proxy } = getAppSettings();

    const serviceUrl = buildUrlWithPath(`${proxy.path}/${gameSetting.socketInfo.namespace}/`);
    try {
        const response = await fetch(serviceUrl);
        statusCode = response.status;
    } catch (error) {
        Sentry.captureException(new Error(`${gameSetting.gameName} service is unavailable`));
    }

    return statusCode === 200;
};
