import { AppTypes, GameIds } from "../../../_shared/constants";
import { getAppSettings } from "../../../_shared/app-settings";

export const GamesInOnePage = 20;

export const GameCategoryConfig = {
    [AppTypes.mobile]: {
        game: [GameIds.BacBall],
        newNumberGames: [GameIds.HappyFour, GameIds.HappyWheel, GameIds.LuckyThree, GameIds.NextBall, GameIds.SicBalls],
    },
};

export enum GameCategoryType {
    game,
    newNumberGames,
}

const SystemGameCategory = {
    ["GN"]: [GameCategoryType.game, GameCategoryType.newNumberGames],
};

export const favoriteGameIdIgnore = []; // TODO: Consider later

export const GameCategoryKeys: string[] = SystemGameCategory[getAppSettings().system]
    .map((value) => GameCategoryType[value])
    .filter((category) => Object.keys(GameCategoryConfig[getAppSettings().appType]).includes(category));
