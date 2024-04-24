import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { IBanner, ILobbyConfigs } from "../../components/page-components/dashboard/type";

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
