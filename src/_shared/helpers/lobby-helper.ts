import { GameBaseProps } from "./../../components/game-base/type";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { IBanner, ILobbyConfigs } from "../../components/page-components/dashboard/type";
import { getAppSettings } from "../app-settings";

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

export const getSwipeableGameId = (isPrevGame: boolean, currentGameId: number, offerGameIds: number[]) => {
    const gameSettings = getAppSettings()?.gameSettings;
    const gameSettingValues = Object.values(gameSettings).filter((setting: GameBaseProps) => offerGameIds.includes(setting.id));

    if (gameSettingValues.length > 0) {
        const lastedGameIdIndex = gameSettingValues.length - 1;
        const currentGameIdIndex = gameSettingValues.findIndex((gameSetting) => gameSetting.id === currentGameId);

        if (currentGameIdIndex === -1) {
            return gameSettingValues[0].id;
        }

        const nextOpenedGameIdIndex = isPrevGame
            ? currentGameIdIndex === 0
                ? lastedGameIdIndex
                : currentGameIdIndex - 1
            : currentGameIdIndex === lastedGameIdIndex
            ? 0
            : currentGameIdIndex + 1;

        return gameSettingValues[nextOpenedGameIdIndex].id;
    }

    return 0;
};
