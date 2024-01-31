import { getAppSettings } from "../app-settings";

export const localStorageKeys = {
    session: buildLocalStorageKey("auth-data"),
    favoriteGames: buildLocalStorageKey("favorite-game"),
    rebet: buildLocalStorageKey("rebet"),
    umInfo: buildLocalStorageKey("um_info"),
    loginStatus: buildLocalStorageKey("login-status"),
    winningStreakNotification: buildLocalStorageKey("winning-streak-notification"),
    playSound: buildLocalStorageKey("play-sound"),
    buildVersion: buildLocalStorageKey("build-version"),
    toolbarGuide: buildLocalStorageKey("toolbarGuide"),
};

export function removeLocalStorageItem(key: string) {
    localStorage.removeItem(key);
}

export function storeLocalStorageItem<Type>(key: string, data: Type) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function getLocalStorageItem<Type>(key: string): Type {
    return JSON.parse(localStorage.getItem(key));
}

export function buildLocalStorageKey(key: string) {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        return `${window.location.hostname}.${key}.${getAppSettings().appType}`;
    }

    return key;
}
