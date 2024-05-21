import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { loadURLContext } from "../../../_shared/react-contexts";
import { getLobbyGameIds, getOfferGamesIds } from "../../../_shared/helpers";
import { getAppSettings } from "../../../_shared/app-settings";
import { LobbySocketConnection } from "../lobby/lobby-socket-connection";
import { ILobbyConfigs } from "./type";

export type AuthorizeHandlerProps = {
    authorizeInfo: AuthorizeResponse;
    session: SSOResponse;
    lobbyConfigs: ILobbyConfigs
};

export class DashboardHandler {
    private authorizeInfo: AuthorizeResponse;
    private session: SSOResponse;
    private lobbyConfigs: ILobbyConfigs;
    public readonly lobbyConnection: LobbySocketConnection;

    constructor(props: AuthorizeHandlerProps) {
        this.session = props.session;
        this.authorizeInfo = props.authorizeInfo;
        this.lobbyConfigs = props.lobbyConfigs;
        this.lobbyConnection = new LobbySocketConnection();

        this.connectLobbySocket();
    }

    getLobbyGamesIds() {
        const offerGamesIds = getOfferGamesIds(this.authorizeInfo);
        console.log('getLobbyGamesIds')
        console.log({ ...offerGamesIds })
        return getLobbyGameIds(this.lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
    };

    async connectLobbySocket() {
        const { gameId } = loadURLContext();
        const offerGamesIds = getOfferGamesIds(this.authorizeInfo)?.filter((id) => id !== gameId);
        const { gameSettings } = getAppSettings();
        const lobbyGamesIds = getLobbyGameIds(this.lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId) && gameSettings[gameId]);
        console.log(`connectLobbySocket lobbyGamesIds`)
        console.log({ ...lobbyGamesIds })
        if (!this.authorizeInfo?.authorized || lobbyGamesIds?.length === 0) {
            console.log(`False connectLobbySocket lobbyGamesIds`)
            return;
        }

        await this.lobbyConnection.initLobbySocket(this.session, lobbyGamesIds);
    };

}
