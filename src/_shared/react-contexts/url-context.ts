import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { AnalyticsHelper, StorageHelper, localStorageKeys } from "../helpers";
import { GameUtils } from "../helpers/base-64-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../helpers/message-transmitter/global-transmitter";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    isThirdParty?: boolean;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
};

export function parseContextFromURL(): URLContextModel | undefined {
    console.log("[URLContext] parseContextFromURL called");
    const params = new URLSearchParams(globalThis.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        console.log("[URLContext] No URL parameters found");
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const isDirectMode = !!params.get("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";
    const isThirdParty = isDirectMode && !!redirectUrl;

    console.log("[URLContext] Parsed from URL - gameId:", gameId, "isDirectMode:", isDirectMode, "redirectUrl:", redirectUrl);

    return { token, language, gameId, isDirectMode, redirectUrl, isThirdParty, firstSSOToLobby: true };
}

export function loadURLContext(): URLContextModel {
    console.log("[URLContext] loadURLContext called");
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    console.log("[URLContext] contextFromURL:", contextFromURL);
    console.log("[URLContext] contextFromLocalStorage:", contextFromLocalStorage);

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageHelper?.set(localStorageKeys.url, contextString);
        AnalyticsHelper?.login(contextFromURL);
        console.log("[URLContext] Stored context from URL:", contextString);
    }

    const result = contextFromURL || contextFromLocalStorage;
    console.log("[URLContext] Final loaded context:", result);
    return result;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        console.log("[URLContext] backToRedirectUrl called with:", redirectUrl);
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            console.log("[URLContext] Redirecting to decoded URL:", decodedUrl);
            globalThis.location.href = decodedUrl;
        } else {
            console.log("[URLContext] No redirect URL - going back to lobby");
            updateURLContext({ backToLobby: true, gameId: 0 });
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.BACK_TO_LOBBY]: {} });
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    console.log("[URLContext] updateURLContext called with:", context);
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    if (context.gameId !== undefined) {
        console.log("[URLContext] Updating latestGameId to:", context.gameId);
        StorageHelper.set(localStorageKeys.latestGameId, context.gameId);
    }

    const updatedContext = { ...contextFromLocalStorage, ...context, firstSSOToLobby: false };
    StorageHelper.set(localStorageKeys.url, updatedContext);
    console.log("[URLContext] Updated context stored:", updatedContext);
}

export function getURLContext() {
    const context = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
    console.log("[URLContext] getURLContext returned:", context);
    return context;
}
