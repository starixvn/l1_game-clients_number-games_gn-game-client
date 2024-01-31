import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";
import { Themes } from "../_shared/constants";

const { userSettings: userSettingsService } = UserClientCommunication.getUserClientInstance();

export const updateUserQuickBetSetting = (session: SSOResponse, value: boolean) => {
    userSettingsService.updateUserQuickBetSetting(session.ss, session.username, value);
};

export const updateThemeSetting = async (userSession: SSOResponse, theme = Themes.light) => {
    return userSettingsService.updateUserThemeSetting(userSession.ss, userSession.username, theme);
};

export const updateSignInSMStatus = async (userSession: SSOResponse) => {
    return userSettingsService.updateSignInSMStatus(userSession.ss, userSession.username);
};
