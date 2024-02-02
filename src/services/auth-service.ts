import { SSOResponse } from "sc-user-service-client/dist/auth";

import { localStorageKeys, StorageHelper } from "../_shared/helpers";
import { UserClientCommunication } from "./user-client-communication";

const { auth: authService, userSettings: userSettingsService } = UserClientCommunication.getUserClientInstance();

export const sso = async (token: string, appType: number): Promise<SSOResponse> => {
    const userSession = await authService.sso(token, appType);

    if (userSession && userSession.isAuthenticated) {
        StorageHelper.set(localStorageKeys.session, userSession);
    }

    return userSession;
};

export const verifySession = async (): Promise<SSOResponse> => {
    const userSession = StorageHelper.get<SSOResponse>(localStorageKeys.session);

    if (!userSession) {
        return null;
    }

    const verifySessionResponse = await authService.verifySession(userSession?.ss, userSession?.username);

    if (verifySessionResponse) {
        userSession.isUM = verifySessionResponse.isUM;
        userSession.umInfo = verifySessionResponse.umInfo;

        verifySessionResponse.isSuccessful && StorageHelper.set(localStorageKeys.session, userSession);
    }

    return verifySessionResponse.isSuccessful || userSession.isUM ? userSession : null;
};

export const clearSession = () => StorageHelper.remove(localStorageKeys.session);

export const reCheckIn = async (userSession: SSOResponse) => {
    return authService.reCheckIn(userSession?.ss, userSession?.username);
};

export const createNickname = async (userSession: SSOResponse, nickname: string, avatarId: number) => {
    return authService.signName(userSession.ss, userSession.username, nickname, avatarId);
};

export const authorize = async (userSession: SSOResponse) => {
    return authService.authorize(userSession.ss, userSession.username);
};

export const getBalance = async (userSession: SSOResponse) => {
    return authService.getBalance(userSession.ss, userSession.username);
};

export const getSettingGames = async (userSession: SSOResponse) => {
    return authService.getSettingGames(userSession.ss, userSession.username);
};
