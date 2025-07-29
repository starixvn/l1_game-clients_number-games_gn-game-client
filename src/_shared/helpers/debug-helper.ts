import { StorageHelper, localStorageKeys } from "./storage-helper";
import { getAppSettings } from "../app-settings";
import { logger } from "./advanced-logger";

export const writeDebugLog = (data: any): void => {
    if (getAppSettings().enableDebugLogs && StorageHelper.get(localStorageKeys.debug) === true) {
        logger.debug('legacy', 'Legacy debug log', data);
    }
};

// Re-export advanced logger functions for convenience
export { logger, writeAdvancedDebugLog } from "./advanced-logger";
