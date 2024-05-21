
import { loadURLContext, PlayerContextModel } from "../../../_shared/react-contexts";
import { buildUrl, getLobbyGameIds, getOfferGamesIds, isKickOutError, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import { getAppSettings } from "../../../_shared/app-settings";
import { LobbySocketConnection } from "../lobby/lobby-socket-connection";
import { DashboardProps } from "./type";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { reCheckIn } from "../../../services/auth-service";
import { ReCheckInResponse } from "sc-user-service-client/dist/auth";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";

export class DashboardHandler {
    private reCheckInInterval: NodeJS.Timeout;

    public isKickOut = false;
    public readonly lobbyConnection: LobbySocketConnection;
    public notificationSocket: Socket = null;

    constructor(
        private props: DashboardProps,
        private showApiErrorMessage: Function,
        private signOut: Function) {
        this.lobbyConnection = new LobbySocketConnection();

        this.connectLobbySocket();
        this.connectNotificationSocket();

        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(this.props.session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: this.props.authorizeResponse?.user?.red });
    }

    connectNotificationSocket() {
        const { proxy, enableMsgpackParser } = getAppSettings();

        const socketUri = buildUrl();
        const socketOption = {
            forceNew: false,
            transports: ["websocket"],
            upgrade: false,
            auth: {
                ss: this.props.session.ss,
                username: this.props.session.username,
            },
            path: `${proxy.path}/notification/socket.io`,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };

        this.notificationSocket = io(socketUri, socketOption);
        this.registerMainSocketEvent(this.notificationSocket);
    }

    checkIsNotOfferGame() {
        return this.props.authorizeResponse?.user?.offerGames &&
            this.props.authorizeResponse?.user?.offerGames.length === 0;
    }

    handleRecheckInResponse(response: ReCheckInResponse) {
        if (!response || !response.isSuccessful) {
            this.signOut();
        } else if (response.apiError) {
            this.handleShowApiErrorMessage(response.apiError.errorCode, response.isDisableAccount);
        } else {
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: response.balance });
        }
    }

    handleShowApiErrorMessage(errorCode: string, isDisableAccount = false) {
        if (isDisableAccount || isKickOutError(errorCode)) {
            this.isKickOut = true;
            setTimeout(() => {
                this.signOut();
            }, 10000);
        }

        this.showApiErrorMessage(errorCode)
    }

    registerMainSocketEvent(mainSocket: Socket) {
        mainSocket.on("auth", this.handleAuth);
        mainSocket.on("kickedOut", this.handleKickedOut);
        mainSocket.on("reload", this.handleReload);
    }

    handleAuth = (authData) => {
        if (!authData.authorized) {
            this.handleKickedOut(authData);
        }
    }

    handleKickedOut = (data: any) => {
        const { umInfo } = data;
        const { setIsUm } = this.props;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            StorageHelper.set(localStorageKeys.umInfo, umInfo);
            setTimeout(() => {
                setIsUm(true);
            }, 500);
        } else {
            this.signOut();
        }
    }

    handleReload() {
        globalThis.location.reload();
    }

    shouldRenderGames = (offerGames: number[], openGameId: number) => {
        const urlContextModel = JSON.parse(localStorage.getItem("urlContext"));
        const backToLobby = urlContextModel.backToLobby || false;
        const ssoRedirectGameId = urlContextModel.gameId || 0;

        return (offerGames.includes(openGameId) && !backToLobby) || ssoRedirectGameId > 0;
    }

    async handleReCheckIn() {
        const reCheckInResponse = await reCheckIn(this.props.session);
        this.handleRecheckInResponse(reCheckInResponse);
    }

    getLobbyGamesIds = () => {
        const offerGamesIds = getOfferGamesIds(this.props.authorizeResponse);
        return getLobbyGameIds(this.props.lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
    };

    removeGameTransmitter = (gameId: number) => {
        this.lobbyConnection.unsubscribeGame(gameId);
    }

    reconnectGameTransmitter = (gameId: number) => {
        this.lobbyConnection.signInGame(this.props.session, gameId);
        return this.lobbyConnection.initGameTransmitter(gameId);
    }

    getOfferGamesIds = () => {
        return getOfferGamesIds(this.props.authorizeResponse);
    }

    buildLobbyConnectionContextValue = () => {
        return {
            socket: this.lobbyConnection.getSocket(),
            gameTransmitters: this.lobbyConnection.getTransmitters(),
            removeGameTransmitter: this.removeGameTransmitter,
            reconnectGameTransmitter: this.reconnectGameTransmitter,
        }
    }

    buildAuthContextValue = () => {
        return {
            authorizeInfo: this.props.authorizeResponse,
            session: this.props.session,
            signOut: this.signOut,
            fractionalOddsFormat: this.props.authorizeResponse.user?.fractionalOddsFormat ?? false,
            enableQuickBet: true
        } as PlayerContextModel;
    }

    async connectLobbySocket() {
        const { gameId } = loadURLContext();
        const offerGamesIds = getOfferGamesIds(this.props.authorizeResponse)?.filter((id) => id !== gameId);
        const { gameSettings } = getAppSettings();
        const lobbyGamesIds = getLobbyGameIds(this.props.lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId) && gameSettings[gameId]);

        if (lobbyGamesIds?.length === 0) {
            console.log(`False connectLobbySocket lobbyGamesIds`)
            return;
        }

        await this.lobbyConnection.initLobbySocket(this.props.session, lobbyGamesIds);
    };

    reset() {
        this.notificationSocket?.close();
        this.lobbyConnection.closeSocket();
        clearInterval(this.reCheckInInterval);
    }
}
