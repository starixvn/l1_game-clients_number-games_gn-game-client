import { IBanner, ILobbyConfigs } from "../react-contexts/lobby-context";

export const getBanners = (lobbyConfigs: ILobbyConfigs): IBanner[] => {
    return lobbyConfigs?.banners;
};
