export const getPathImageGameId = (gameId: number) => {
    switch (gameId) {
        case 1001:
        case 1002:
            return ["bac-number"];
        case 1003:
        case 1004:
            return ["next-ball"];
        default:
            return [];
    }
};

export const getPathBanner = (locale: string, gameId = 1003) => {
    return [`lobby/banners/${gameId}/${gameId}_${locale}.gif`];
};

export const getPathIconGames = (gameIds: number[]): string[] => {
    const bgIcons = ["lobby/game-board-detail/bg-game-board-2x.webp", "lobby/game-board-detail/bg-game-board.webp"];
    return [...gameIds.map((gameId) => `lobby/game-board-detail/${gameId}`), ...bgIcons];
};

export const pathImageMapping = {
    lobby: ["bg.webp", "bg-galaxy-small.webp", "dot", "hide-toolbar-guide"],
    game: ["cage", "cage/number", "ball", "chips/gn", "countdown-timer", "dot", "switch-games-guide", "bets", "icons"],
};
