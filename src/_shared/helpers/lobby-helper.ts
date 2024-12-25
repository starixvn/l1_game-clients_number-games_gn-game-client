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
    console.log('getLobbyGameIds - Input:', {
        hasLobbyConfigs: !!lobbyConfigs,
        categories: lobbyConfigs?.categories?.length || 0,
        firstCategoryGames: lobbyConfigs?.categories?.[0]?.gameSettings?.length || 0
    });

    const gameIds = lobbyConfigs?.categories?.[0]?.gameSettings?.map((setting) => setting.gameId);

    console.log('getLobbyGameIds - Output:', {
        count: gameIds?.length || 0,
        ids: gameIds
    });

    return gameIds;
};

export const getBannerIds = (lobbyConfigs: ILobbyConfigs) => {
    const banners = lobbyConfigs?.banners;

    return banners?.map((banner) => banner.gameId) ?? [];
};

export const getLobbyGamesIds = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse) => {
    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    console.log('getLobbyGamesIds - Offer Games:', {
        count: offerGamesIds?.length || 0,
        ids: offerGamesIds,
        authorizeInfo: {
            hasAuthorizeInfo: !!authorizeInfo,
        }
    });

    const lobbyGameIds = getLobbyGameIds(lobbyConfigs);
    console.log('getLobbyGamesIds - Lobby Games:', {
        count: lobbyGameIds?.length || 0,
        ids: lobbyGameIds,
        lobbyConfigs: {
            hasConfigs: !!lobbyConfigs,
            categories: lobbyConfigs?.categories?.length || 0
        }
    });

    const filteredGameIds = lobbyGameIds?.filter((gameId) => offerGamesIds.includes(gameId));
    console.log('getLobbyGamesIds - Filtered Games:', {
        count: filteredGameIds?.length || 0,
        ids: filteredGameIds
    });

    return filteredGameIds;
};

export const getRenderGameSettings = (lobbyConfigs: ILobbyConfigs, offerGamesIds: number[]) => {
    if (lobbyConfigs && offerGamesIds) {
        console.log('getRenderGameSettings - Input:', {
            hasLobbyConfigs: !!lobbyConfigs,
            offerGamesCount: offerGamesIds?.length || 0,
            offerGameIds: offerGamesIds
        });

        const { gameSettings: allGamesSettings } = getAppSettings();
        console.log('getRenderGameSettings - All Games:', {
            totalGames: Object.keys(allGamesSettings || {}).length,
            gameIds: Object.keys(allGamesSettings || {})
        });

        const lobbyGameIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
        console.log('getRenderGameSettings - Filtered Lobby Games:', {
            count: lobbyGameIds?.length || 0,
            ids: lobbyGameIds
        });

        const mappedGames = lobbyGameIds?.map((gameId) => allGamesSettings[gameId]);
        console.log('getRenderGameSettings - Mapped Games:', {
            count: mappedGames?.length || 0,
            games: mappedGames?.map(g => ({ id: g?.id, name: g?.gameName }))
        });

        const finalGames = mappedGames.filter((settings) => settings && !settings.isComingSoon);
        console.log('getRenderGameSettings - Final Games:', {
            count: finalGames?.length || 0,
            games: finalGames?.map(g => ({
                id: g.id,
                name: g.gameName,
                isComingSoon: g.isComingSoon
            }))
        });

        return finalGames;
    }
    console.log('getRenderGameSettings - No Input:', {
        hasLobbyConfigs: !!lobbyConfigs,
        hasOfferGames: !!offerGamesIds
    });
    return [];
};

export const getEnabledRenderGameSettings = (lobbyConfigs: ILobbyConfigs, authorizeInfo: AuthorizeResponse): GameSettings[] => {
    const gameOfferIds = getLobbyGamesIds(lobbyConfigs, authorizeInfo);
    if (gameOfferIds.length > 0) {
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
