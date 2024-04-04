import { IUserServiceClient } from "sc-user-service-client/dist";
let UserServiceClient;

if (typeof window !== "undefined") {
    UserServiceClient = require("sc-user-service-client").default;
}

import { getAppSettings } from "../_shared/app-settings";
import { buildUrlWithPath } from "../_shared/helpers/url-helper";

export class UserClientCommunication {
    private static readonly instance: IUserServiceClient;

    public static getUserClientInstance() {
        return this.instance ?? (typeof window !== "undefined" && new UserServiceClient(this.getUserServiceUrl()));
    }

    private static getUserServiceUrl(): string {
        const { proxy } = getAppSettings();
        const path = proxy.path === "" ? "/user" : `${proxy.path}/user`;
        return buildUrlWithPath(path);
    }
}
export default UserClientCommunication;
