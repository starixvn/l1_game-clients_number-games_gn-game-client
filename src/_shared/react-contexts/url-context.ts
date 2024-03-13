import { createContext, useContext } from "react";
import { StorageHelper, localStorageKeys } from "../helpers";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    backToLobby?: Function;
};

export function parseContextFromURL(): URLContextModel | undefined {
    const params = new URLSearchParams(globalThis.location?.search);

    // Reload page
    if (params.size === 0) {
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const isDirectMode = params.has("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";

    return { token, language, gameId, isDirectMode, redirectUrl };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageHelper.set(localStorageKeys.url, contextString);
    }

    return contextFromURL || contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToLobby: () => {
        globalThis.location.reload();
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const URLContextProvider = URLContext.Provider;
export const URLContextConsumer = URLContext.Consumer;
export const useURLContext = () => useContext(URLContext);
