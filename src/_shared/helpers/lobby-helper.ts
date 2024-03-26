import { IBanner, ILobbyConfigs } from "../../components/page-components/dashboard/type";

export const getBanners = (lobbyConfigs: ILobbyConfigs): IBanner[] => {
    return lobbyConfigs?.banners;
};
