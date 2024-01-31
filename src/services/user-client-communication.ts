import UserServiceClient from "sc-user-service-client";
import { getAppSettings } from "../_shared/app-settings";
import { buildUrlWithPath } from "../_shared/helpers/url-helper";

export class UserClientCommunication {
    private static readonly instance: UserServiceClient;

    public static getUserClientInstance() {
        return this.instance ?? new UserServiceClient(this.getUserServiceUrl());
    }

    private static getUserServiceUrl(): string {
        const { proxy } = getAppSettings();
        const path = proxy.path === "" ? "/user" : `${proxy.path}/user`;
        return buildUrlWithPath(path);
    }
}
