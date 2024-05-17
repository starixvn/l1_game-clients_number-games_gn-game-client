import isEmpty from "lodash/isEmpty";
import Router from "next/router";
import { createContext, useContext } from "react";
import { AnalyticsHelper, StorageHelper, localStorageKeys } from "../helpers";
import { GameUtils } from "../helpers/base-64-helper";
import { GlobalMessageTransmitter } from "../helpers/message-transmitter/global-transmitter";

export type URLContextModel = {
    token?: string;
    language?: string;
    gameId?: number;
    isDirectMode?: boolean;
    redirectUrl?: string;
    backToLobby?: boolean;
    backToRedirectUrl?: Function;
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
    return { token, language, gameId, isDirectMode, redirectUrl };
}

export function loadURLContext(): URLContextModel {
    const contextFromURL = parseContextFromURL();
    let contextFromLocalStorage = {};
    if (typeof window !== 'undefined') {
        contextFromLocalStorage = JSON.parse(localStorage.getItem("urlContext"));
    }

    if (!!contextFromURL) {
        const contextString = { ...contextFromURL, token: undefined };

        globalThis.history.pushState(null, "", globalThis.location?.href.split("?")[0]);
        if (typeof window !== 'undefined') {
            localStorage.setItem("urlContext", JSON.stringify(contextString));
        }
        AnalyticsHelper?.login(contextFromURL);
    }

    return contextFromURL || contextFromLocalStorage;
}

export const initialURLContextData = {
    ...loadURLContext(),
    backToRedirectUrl: (redirectUrl: string) => {
        if (!isEmpty(redirectUrl)) {
            globalThis.location.href = GameUtils.base64Decode(redirectUrl);
        } else {
            updateURLContext({ backToLobby: true });
            GlobalMessageTransmitter.broadcast({ updateGameIdDashboard: {} });
            // Router.push("/", null, { shallow: true });
        }
    },
};

export const URLContext = createContext<URLContextModel>(initialURLContextData);

export const useURLContext = () => useContext(URLContext);

export function updateURLContext(context: Partial<URLContextModel>) {
    if (typeof window !== 'undefined') {
        const contextFromLocalStorage = JSON.parse(localStorage.getItem("urlContext"));

        localStorage.setItem("urlContext", JSON.stringify({ ...contextFromLocalStorage, ...context }));


        // StorageHelper.set("urlContext", { ...contextFromLocalStorage, ...context });
    }
}

export function getURLContext() {
    if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem("urlContext"));
    }
    return {};
}
