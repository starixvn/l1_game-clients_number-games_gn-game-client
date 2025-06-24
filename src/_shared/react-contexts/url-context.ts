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
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
    firstSSOToLobby?: boolean;
    isSabaPlay?: boolean;
};

export function parseContextFromURL(): URLContextModel | undefined {
    const params = new URLSearchParams(globalThis.location?.search);
    // Reload page
    if (Array.from(params.values()).length === 0) {
        return;
    }

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const isDirectMode = !!params.get("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";
    const isSabaPlay = params.get("op") === "SP";

    return { token, language, gameId, isDirectMode, redirectUrl, firstSSOToLobby: true, isSabaPlay };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    const contextFromLocalStorage = StorageHelper?.get(localStorageKeys.url) || null;

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        StorageHelper?.set(localStorageKeys.url, contextString);
        AnalyticsHelper?.login(contextFromURL);
    }

    const result = contextFromURL || contextFromLocalStorage;
    return result;
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
        StorageHelper.set(localStorageKeys.latestGameId, context.gameId);
    }

    const updatedContext = { ...contextFromLocalStorage, ...context, firstSSOToLobby: false };
    StorageHelper.set(localStorageKeys.url, updatedContext);
}

export function getURLContext() {
    const context = StorageHelper.get<URLContextModel>(localStorageKeys.url) || {};
    return context;
}
