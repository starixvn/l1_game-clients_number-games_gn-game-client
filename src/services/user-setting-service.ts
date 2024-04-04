import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";

const userSettingsService = UserClientCommunication?.getUserClientInstance()?.userSettings;

export const updateUserQuickBetSetting = async (session: SSOResponse, value: boolean) => {
    return userSettingsService?.updateUserQuickBetSetting(session.ss, session.username, value);
};

export const updateSignInSMStatus = async (userSession: SSOResponse) => {
    return userSettingsService?.updateSignInSMStatus(userSession.ss, userSession.username);
};

export const updateUserAvatar = async (userSession: SSOResponse, avatarId: number) => {
    return userSettingsService?.updateAvatar(userSession.ss, userSession.username, avatarId);
};
