import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";

const { lobby: lobbyService } = UserClientCommunication.getUserClientInstance();

export const getLobbyConfigs = async (session: SSOResponse) => {
    return lobbyService.getLobbyConfigs(session.ss, session.username);
};
