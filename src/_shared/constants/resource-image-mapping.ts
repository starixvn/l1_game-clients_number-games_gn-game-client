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

export const pathImageMapping = {
    lobby: ["dot", "lobby/game-board-detail", "lobby/banners/1001", "hide-toolbar-guide"],
    game: ["icons", "cage", "ball", "countdown-timer", "dot", "switch-games-guide", "bets"],
};
