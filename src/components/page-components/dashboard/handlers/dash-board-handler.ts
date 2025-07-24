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
        const offerGames = getOfferGamesIds(this.props.authorizeResponse);

        if (this.props.directMode) {
            // Fix: When queryGame is 0, it means lobby, not a specific game
            // So it should not be treated as "not in offer"
            if (this.props.queryGame === 0) {
                return false;
            }

            return !offerGames?.includes(this.props.queryGame);
        }

        return (
            (this.props.authorizeResponse?.user?.offerGames && this.props.authorizeResponse?.user?.offerGames.length === 0) ||
            !this.getLobbyGamesIds()?.length
        );
    };

    shouldRenderGames = (offerGames: number[], openGameId: number | null) => {
        const urlContextModel = StorageHelper.get<URLContextModel>(localStorageKeys.url);
        const backToLobby = urlContextModel?.backToLobby || false;
        const ssoRedirectGameId = urlContextModel?.gameId || 0;

        // Fix: Use ssoRedirectGameId when openGameId is null/0/undefined
        const effectiveGameId = (openGameId === 0 || openGameId === null || openGameId === undefined) ? ssoRedirectGameId : openGameId;

        if (effectiveGameId === 0 || effectiveGameId === null || effectiveGameId === undefined) {
            return false;
        }

        return (offerGames.includes(effectiveGameId) && !backToLobby) || ssoRedirectGameId > 0;
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
            return;
        }

        await this.lobbyConnection.initLobbySocket(this.props.session, lobbyGamesIds);
        this.updateGameTransmitters(this.lobbyConnection.getTransmitters());
    };

    reset = () => {
        this.lobbyConnection.closeSocket();
    };
}
