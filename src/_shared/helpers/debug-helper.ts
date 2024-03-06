import { StorageHelper, localStorageKeys } from "./storage-helper";

export const writeDebugLog = (data) => {
    if (StorageHelper.get(localStorageKeys.debug) === true) {
        console.log(JSON.stringify(data));
    }
};
