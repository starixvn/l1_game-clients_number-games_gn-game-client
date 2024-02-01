import { AppTypes } from "../../../_shared/constants";
import { getAppSettings } from "../../../_shared/app-settings";

export const GamesInOnePage = 20;

export const GameCategoryConfig = {
    [AppTypes.mobile]: {
        hot: [1001],
        newNumberGames: [1001, 1112, 1113, 1114, 1115, 1116],
    },
};

export enum GameCategoryType {
    hot,
    newNumberGames,
}

const SystemGameCategory = {
    ["GN"]: [GameCategoryType.hot, GameCategoryType.newNumberGames],
};

export const favoriteGameIdIgnore = []; // TODO: Consider later

export const GameCategoryKeys: string[] = SystemGameCategory[getAppSettings().system]
    .map((value) => GameCategoryType[value])
    .filter((category) => Object.keys(GameCategoryConfig[getAppSettings().appType]).includes(category));
