import { getAppSettings } from "../app-settings";

interface IActionStorage {
    remove: (name: string) => void;
    get: (name: string) => string | object;
    set: (name: string, value: string | object, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

declare global {
    interface Window {
        localMemory: object;
    }
}

export class LocalStorage implements IActionStorage {
    remove(name: string) {
        localStorage.removeItem(name);
    }

    get(name: string) {
        const storage = localStorage.getItem(name);
        if (!storage) {
            return null;
        }
        try {
            return JSON.parse(storage);
        } catch (error) {
            console.warn(`LocalStorage ${name} can not parse`);
            return null;
        }
    }

    set(name: string, value: string | object) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        const test = "test storage";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.log("Browser not support Local Storage");
            return false;
        }
    }
}

export class Memory implements IActionStorage {
    localMemory: any;
    constructor() {
        window.localMemory = {};
        this.localMemory = window.localMemory;
    }

    remove(name: string) {
        delete this.localMemory[name];
    }

    get(name: string) {
        return this.localMemory[name] ? this.localMemory[name] : null;
    }

    set(name: string, value: any) {
        this.localMemory[name] = value;
    }

    isAvailable() {
        return true;
    }
}

export class StorageHelper {
    static supportStorage: IActionStorage;
    static prefixKey: string;

    private static initialize() {
        if (!StorageHelper.supportStorage) {
            const allStorage = [new LocalStorage(), new Memory()];
            StorageHelper.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];
        }
    }

    static getCurrentStorage() {
        StorageHelper.initialize();
        return StorageHelper.supportStorage;
    }

    static get<T>(name: string) {
        return StorageHelper.getCurrentStorage().get(StorageHelper.getName(name)) as T;
    }

    static set(name: string, value: any) {
        StorageHelper.getCurrentStorage().set(StorageHelper.getName(name), value);
    }

    static remove(name: string) {
        StorageHelper.getCurrentStorage().remove(StorageHelper.getName(name));
    }

    static setPrefixKey(prefixKey: string) {
        StorageHelper.prefixKey = prefixKey;
    }

    static getName(name: string) {
        return StorageHelper.prefixKey ? `${StorageHelper.prefixKey}_${name}` : name;
    }
}

export const localStorageKeys = {
    session: buildLocalStorageKey("auth-data"),
    rebet: buildLocalStorageKey("rebet"),
    umInfo: buildLocalStorageKey("um_info"),
    loginStatus: buildLocalStorageKey("login-status"),
    winningStreakNotification: buildLocalStorageKey("winning-streak-notification"),
    playSound: buildLocalStorageKey("play-sound"),
    buildVersion: buildLocalStorageKey("build-version"),
    toolbarGuide: buildLocalStorageKey("toolbarGuide"),
};

export function buildLocalStorageKey(key: string) {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        return `${window.location.hostname}.${key}.${getAppSettings().appType}`;
    }

    return key;
}
