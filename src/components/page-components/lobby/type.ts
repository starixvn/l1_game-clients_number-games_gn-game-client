export type LobbyConfigs = {
    banners: [{ gameId: number; displayTime: number }];
    categories: [{ gameSettings: LobbyGameSetting[] }];
};

export type LobbyGameSetting = {
    gameId: number;
};
