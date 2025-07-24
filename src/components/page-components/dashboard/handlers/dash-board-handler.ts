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
        // console.log("[DashboardHandler] constructor - Props:", props);
        this.lobbyConnection = lobbyConnection ?? new LobbySocketConnection();
        this.connectLobbySocket();
    }

    checkIsNotOfferGame = () => {
        const offerGames = getOfferGamesIds(this.props.authorizeResponse);
        // console.log("[DashboardHandler] checkIsNotOfferGame - offerGames:", offerGames);
        // console.log("[DashboardHandler] checkIsNotOfferGame - props:", { directMode: this.props.directMode, queryGame: this.props.queryGame });

        if (this.props.directMode) {
            // Fix: When queryGame is 0, it means lobby, not a specific game
            // So it should not be treated as "not in offer"
            if (this.props.queryGame === 0) {
                // console.log("[DashboardHandler] checkIsNotOfferGame - Direct mode with queryGame 0 (lobby), returning false");
                return false;
            }

            const result = !offerGames?.includes(this.props.queryGame);
            // console.log("[DashboardHandler] checkIsNotOfferGame - Direct mode result:", result);
            return result;
        }

        const result = (
            (this.props.authorizeResponse?.user?.offerGames && this.props.authorizeResponse?.user?.offerGames.length === 0) ||
            !this.getLobbyGamesIds()?.length
        );
        // console.log("[DashboardHandler] checkIsNotOfferGame - Non-direct mode result:", result);
        return result;
    };

    shouldRenderGames = (offerGames: number[], openGameId: number | null) => {
        // console.log("[DashboardHandler] shouldRenderGames - Input:", { offerGames, openGameId });

        const urlContextModel = StorageHelper.get<URLContextModel>(localStorageKeys.url);
        const backToLobby = urlContextModel?.backToLobby || false;
        const ssoRedirectGameId = urlContextModel?.gameId || 0;

        // console.log("[DashboardHandler] shouldRenderGames - URL context:", { backToLobby, ssoRedirectGameId });

        // Fix: Use ssoRedirectGameId when openGameId is null/0/undefined
        const effectiveGameId = (openGameId === 0 || openGameId === null || openGameId === undefined) ? ssoRedirectGameId : openGameId;

        // console.log("[DashboardHandler] shouldRenderGames - Effective gameId:", effectiveGameId);

        if (effectiveGameId === 0 || effectiveGameId === null || effectiveGameId === undefined) {
            // console.log("[DashboardHandler] shouldRenderGames - Effective gameId is 0/null/undefined, returning false");
            return false;
        }

        const result = (offerGames.includes(effectiveGameId) && !backToLobby) || ssoRedirectGameId > 0;
        // console.log("[DashboardHandler] shouldRenderGames - Final result:", result);
        // console.log("[DashboardHandler] shouldRenderGames - Breakdown:", {
        //     effectiveGameId,
        //     offerGamesIncludes: offerGames.includes(effectiveGameId),
        //     notBackToLobby: !backToLobby,
        //     ssoRedirectGameIdGreaterThan0: ssoRedirectGameId > 0
        // });

        return result;
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
