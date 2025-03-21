import * as Sentry from "@sentry/nextjs";
import axios from "axios";
import { getAppSettings } from "../app-settings";
import { delayTime } from "./utils";

export const buildUrl = (subDomain = getAppSettings().proxy?.subDomain, path = "/") => {
    const { proxy } = getAppSettings();
    const domain = getRootDomain();
    const subDomainText = `${subDomain}.`;
    return `${proxy.ssl ? "https" : "http"}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
};

export const getRootDomain = () => {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        const hostName = window.location.hostname;
        return (
            (!!getAppSettings().serverDomainMapper && getAppSettings().serverDomainMapper[hostName]) || extractDomainFromHostName(hostName)
        );
    }

    return "";
};

export const extractDomainFromHostName = (hostName: string) => {
    const domainParts = hostName.split(".").reverse();
    return `${domainParts[1]}.${domainParts[0]}`;
};

export const buildGameGuideUrl = () => {
    return buildUrl(getAppSettings().subGuideDomain, "");
};

export const buildServerUrl = (path: string) => {
    const pathStr = `/user/${path}`;
    return buildUrlWithPath(pathStr);
};

type GameServiceProxy = {
    socketUri: string;
    url: string;
};

export type ProxyConfiguration = {
    subDomain: string;
    defaultSubDomain: string;
    gameIds: number[];
    subPath: string;
};

export const buildGameServiceProxy = async (path: string, gameId: number): Promise<GameServiceProxy> => {
    const { proxy } = getAppSettings();
    const domain = getRootDomain();

    const url = buildUrlWithPath("/game/proxy/");
    let proxyConfiguration: ProxyConfiguration;
    let retryCount = 0;

    while (retryCount < 3) {
        console.log("Try load configuration ", retryCount + 1);
        proxyConfiguration = await axios
            .get(url)
            .then((response) => response.data)
            .catch(() => {});

        if (proxyConfiguration) {
            break;
        }
        retryCount++;
        await delayTime(3);
    }

    if (!proxyConfiguration || Object.keys(proxyConfiguration).length === 0) {
        Sentry.captureException(new Error(`Can not load game service proxy`));
        return {
            socketUri: buildServerUrl(path),
            url: "",
        };
    }

    const isGameUsingDefaultSubDomain = !proxyConfiguration.gameIds.includes(gameId);
    const subPath = proxyConfiguration.subPath;

    const gameServicePath = `${subPath ? "/" + subPath : ""}/${path}`;
    const socketGameServicePath = `${subPath ? "/" + subPath : ""}/user/${path}`;

    const subDomain = isGameUsingDefaultSubDomain ? proxyConfiguration.defaultSubDomain : proxyConfiguration.subDomain;
    const subDomainText = `${subDomain}.`;

    return {
        socketUri: `${proxy.ssl ? "https" : "http"}://${subDomain === "" ? "" : subDomainText}${domain}${socketGameServicePath}`,
        url: `${proxy.ssl ? "https" : "http"}://${subDomain === "" ? "" : subDomainText}${domain}${gameServicePath}`,
    };
};

export const buildUrlWithPath = (path: string) => {
    return buildUrl(getAppSettings().proxy?.subDomain, path);
};
