import { AuthorizeResponse, EnabledGame } from "sc-user-service-client/dist/auth";
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
    return lobbyConfigs.categories?.[0]?.gameSettings?.map((setting) => setting.gameId);
};

export const getBannerIds = (lobbyConfigs: ILobbyConfigs) => {
    const banners = lobbyConfigs?.banners;

    return banners?.map((banner) => banner.gameId) ?? [];
};

export const getLobbyGamesIds = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    return getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
};

export const getAvailableGameSettings = (lobbyConfigs: ILobbyConfigs, offerGamesIds: number[]) => {
    if (lobbyConfigs && offerGamesIds) {
        const { gameSettings: allGamesSettings } = getAppSettings();
        const lobbyGameIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
        return lobbyGameIds?.map((gameId) => allGamesSettings[gameId]).filter((settings) => settings && !settings.isComingSoon);
    }
    return [];
};

export const getEnabledAvailableGameSettings = (availableGameSetting: GameSettings[], enabledGames: EnabledGame[]) =>
    availableGameSetting.filter((gameSetting) => enabledGames.find((enableGame) => enableGame.gameId === gameSetting.id));

export const getServiceStatus = async (gameSetting: GameSettings) => {
    let statusCode = 0;
    const serviceUrl = buildUrlWithPath(`/${gameSetting.socketInfo.namespace}/`);
    try {
        const response = await fetch(serviceUrl);
        statusCode = response.status;
    } catch (error) {}

    return statusCode === 200;
};
