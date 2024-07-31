import { getAppSettings } from "../../../../_shared/app-settings";
import { getLobbyGameIds, getOfferGamesIds, localStorageKeys, StorageHelper } from "../../../../_shared/helpers";
import { loadURLContext, URLContextModel } from "../../../../_shared/react-contexts";
import { LobbySocketConnection } from "../../lobby/lobby-socket-connection";
import { DashboardProps } from "../type";

export class DashboardHandler {
    public readonly lobbyConnection: LobbySocketConnection;

    constructor(
        private readonly props: DashboardProps,
        private readonly updateGameTransmitters: Function,
        lobbyConnection: LobbySocketConnection = null
    ) {
        this.lobbyConnection = lobbyConnection ?? new LobbySocketConnection();
        this.connectLobbySocket();
    }

    checkIsNotOfferGame = () => {
        return this.props.authorizeResponse?.user?.offerGames && this.props.authorizeResponse?.user?.offerGames.length === 0;
    };

    shouldRenderGames = (offerGames: number[], openGameId: number) => {
        const urlContextModel = StorageHelper.get<URLContextModel>(localStorageKeys.url);
        const backToLobby = urlContextModel?.backToLobby || false;
        const ssoRedirectGameId = urlContextModel?.gameId || 0;

        return (offerGames.includes(openGameId) && !backToLobby) || ssoRedirectGameId > 0;
    };

    getLobbyGamesIds = () => {
        const offerGamesIds = getOfferGamesIds(this.props.authorizeResponse);
        return getLobbyGameIds(this.props.lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
    };

    removeGameTransmitter = (gameId: number) => {
        this.lobbyConnection.unsubscribeGame(gameId);
    };

    reconnectGameTransmitter = (gameId: number) => {
        this.lobbyConnection.signInGame(this.props.session, gameId);
        return this.lobbyConnection.initGameTransmitter(gameId);
    };

    getOfferGamesIds = () => {
        return getOfferGamesIds(this.props.authorizeResponse);
    };

    buildLobbyConnectionContextValue = () => {
        return {
            socket: this.lobbyConnection.getSocket(),
            gameTransmitters: this.lobbyConnection.getTransmitters(),
            removeGameTransmitter: this.removeGameTransmitter,
            reconnectGameTransmitter: this.reconnectGameTransmitter,
        };
    };

    connectLobbySocket = async () => {
        const { gameId, isDirectMode } = loadURLContext();
        if (isDirectMode) {
            return;
        }
        const offerGamesIds = getOfferGamesIds(this.props.authorizeResponse)?.filter((id) => id !== gameId);
        const { gameSettings } = getAppSettings();
        const lobbyGamesIds = getLobbyGameIds(this.props.lobbyConfigs)?.filter(
            (gameId) => offerGamesIds.includes(gameId) && gameSettings[gameId]
        );

        if (lobbyGamesIds?.length === 0) {
            console.log(`False connectLobbySocket lobbyGamesIds`);
            return;
        }

        await this.lobbyConnection.initLobbySocket(this.props.session, lobbyGamesIds);
        this.updateGameTransmitters(this.lobbyConnection.getTransmitters());
    };

    reset = () => {
        this.lobbyConnection.closeSocket();
    };
}
