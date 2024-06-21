import { getGameSettings } from "../app-settings";

export const getDevicePixelRatio = () => {
    return (typeof window !== "undefined" && window?.devicePixelRatio) || 0;
};

export const getPathImageGameId = (gameId: number) => {
    const gameSettings = getGameSettings(gameId);
    const gameImagePath = gameSettings?.gameResourceConfigs?.path || "";
    const optionalGamePaths = gameSettings?.gameResourceConfigs?.optionalPaths || [];

    if (!gameImagePath) {
        return [];
    }

    const devicePixelRatioSuffix = getDevicePixelRatio() > 1 ? "/2x" : "/1x";
    return [gameImagePath, `${gameImagePath}${devicePixelRatioSuffix}`, ...optionalGamePaths];
};

export const getPathBanner = (locale: string, gameId: number) => {
    if (!gameId) {
        return [];
    }
    return [`lobby/banners/${gameId}/${gameId}_${locale}.gif`];
};

export const getPathIconGames = (gameIds: number[]): string[] => {
    if (gameIds?.length < 0) {
        return [];
    }
    const bgIcons = ["lobby/game-board-detail/bg-game-board-2x.webp"];
    return [...gameIds.map((gameId) => `lobby/game-board-detail/${gameId}`), ...bgIcons];
};

export const pathImageMapping = {
    lobby: ["bg-galaxy.webp", "bg.webp", "dot", "hide-toolbar-guide"],
    game: ["cage", "cage/number", "ball", "chips/gn", "countdown-timer", "dot", "switch-games-guide", "coin-outline.svg", "icons"],
};
