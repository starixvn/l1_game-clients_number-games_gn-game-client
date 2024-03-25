export interface ILobbyConfigs {
    name: string;
    currencyGroupIds: string[];
    miniPanelGameIds: number[];
    categories: IGameCategory[];
    banners: IBanner[];
}

export interface IBanner {
    gameId: number;
    displayTime: number;
}

export interface IGameCategory {
    name: any;
    gameSettings: IGameSetting[];
}

export interface IGameSetting {
    gameId: number;
    bigSize: boolean;
    newTag: boolean;
}

export interface ILobbyContextModel {
    lobbyConfigs: ILobbyConfigs;
}

export const initialLobbyContextModel = (): ILobbyContextModel => {
    return {
        lobbyConfigs: null,
    };
};
