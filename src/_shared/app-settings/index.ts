import getConfig from "next/config";

import AppSettings from "./type";

const defaultAppSettings: AppSettings = getConfig().publicRuntimeConfig;
let mergedAppSettings: AppSettings;

export const getAppSettings = () => {
    if (mergedAppSettings) {
        return mergedAppSettings;
    }

    mergedAppSettings = defaultAppSettings;

    if (global.window) {
        defaultAppSettings.serverDomainMapper = undefined;
        mergedAppSettings = global.window["envConfig"] ? { ...defaultAppSettings, ...global.window["envConfig"] } : defaultAppSettings;
        global.window["mergedAppSettings"] = mergedAppSettings;
    }

    return mergedAppSettings;
};
