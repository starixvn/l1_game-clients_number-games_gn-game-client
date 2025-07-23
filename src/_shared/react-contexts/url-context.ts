import isEmpty from "lodash/isEmpty";
import { createContext, useContext } from "react";
import { AnalyticsHelper, StorageHelper, localStorageKeys, setUserLatestGameId } from "../helpers";
import { GameUtils } from "../helpers/base-64-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../helpers/message-transmitter/global-transmitter";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
    isSabaPlay?: boolean;
};

export function parseContextFromURL(): URLContextModel | undefined {
    // Fix: Handle HTML-encoded ampersands by decoding them first
    const rawSearch = globalThis.location?.search || '';
    const decodedSearch = rawSearch.replace(/&amp;/g, '&');

    const params = new URLSearchParams(decodedSearch);
    console.log("[URLContext] parseContextFromURL - URL search params:", globalThis.location?.search);
    console.log("[URLContext] parseContextFromURL - Decoded search params:", decodedSearch);
    console.log("[URLContext] parseContextFromURL - All params:", Array.from(params.entries()));

    // Reload page
    if (Array.from(params.values()).length === 0) {
        console.log("[URLContext] parseContextFromURL - No URL parameters found, returning undefined");
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const redirectUrl = params.get("rurl");
    const ref = params.get("ref");
    const isSabaPlay = params.get("op") === "SP";

    // Fix: When gameId=0 (lobby), ignore rurl parameter to allow lobby access
    // Treat SabaPlay URLs as direct mode since they should go directly to the specified game
    // But when gameId=0 (lobby), treat it like op=GN to go through SSO redirect logic
    // Also keep the existing logic for ref + redirectUrl, but ignore redirectUrl when gameId=0
    const effectiveRedirectUrl = gameId === 0 ? null : redirectUrl;
    const isDirectMode = !!(ref && effectiveRedirectUrl) || (isSabaPlay && gameId !== 0);

    console.log("[URLContext] parseContextFromURL - Direct mode calculation:", {
        ref,
        redirectUrl,
        effectiveRedirectUrl,
        isSabaPlay,
        gameId,
        isDirectMode
    });

    const result = { token, language, gameId, isDirectMode, redirectUrl: effectiveRedirectUrl, firstSSOToLobby: true, isSabaPlay };
    console.log("[URLContext] parseContextFromURL - Parsed result:", result);

    return result;
}

export function loadURLContext(): URLContextModel {
    console.log("[URLContext] loadURLContext - Starting URL context loading");
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    console.log("[URLContext] loadURLContext - Context from URL:", contextFromURL);
    console.log("[URLContext] loadURLContext - Context from localStorage:", contextFromLocalStorage);

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };
        console.log("[URLContext] loadURLContext - Storing context in localStorage:", contextString);

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageHelper?.set(localStorageKeys.url, contextString);
        AnalyticsHelper?.login(contextFromURL);
    }

    const finalContext = contextFromURL || contextFromLocalStorage;
    console.log("[URLContext] loadURLContext - Final context returned:", finalContext);
    return finalContext;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        if (!isEmpty(redirectUrl)) {
            const decodedUrl = GameUtils.base64Decode(redirectUrl);
            globalThis.location.href = decodedUrl;
        } else {
            updateURLContext({ backToLobby: true, gameId: 0 });
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.BACK_TO_LOBBY]: {} });
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    const contextFromLocalStorage = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};

    if (context.gameId !== undefined) {
        // Use user-specific latestGameId if username is available in the session
        const session = StorageHelper.get<any>(localStorageKeys.session);
        const username = session?.username;
        setUserLatestGameId(context.gameId, username);
    }

    const updatedContext = { ...contextFromLocalStorage, ...context, firstSSOToLobby: false };
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    return StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
}
