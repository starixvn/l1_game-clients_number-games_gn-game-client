import { GameIds } from ".";

export const getPathImageGameId = (gameId: number) => {
    switch (gameId) {
        case GameIds.BacBall1:
        case GameIds.BacBall2:
            return ["bac-number", `${window.devicePixelRatio > 1 ? "bac-number/2x" : "bac-number/1x"}`];
        case GameIds.NextBall1:
        case GameIds.NextBall2:
            return ["next-ball", `${window.devicePixelRatio > 1 ? "next-ball/2x" : "next-ball/1x"}`];
        default:
            return [];
    }
};

export const getPathBanner = (locale: string, gameId: number) => {
    return [`lobby/banners/${gameId}/${gameId}_${locale}.gif`];
};

export const getPathIconGames = (gameIds: number[]): string[] => {
    const bgIcons = ["lobby/game-board-detail/bg-game-board-2x.webp", "lobby/game-board-detail/bg-game-board.webp"];
    return [...gameIds.map((gameId) => `lobby/game-board-detail/${gameId}`), ...bgIcons];
};

export const pathImageMapping = {
    lobby: ["bg.webp", "bg-galaxy-small.webp", "dot", "hide-toolbar-guide", "lobby/banners/banner-blur.jpg"],
    game: ["cage", "cage/number", "ball", "chips/gn", "countdown-timer", "dot", "switch-games-guide", "coin-outline.svg", "icons"],
};
