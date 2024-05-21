
import { buildUrl, isKickOutError, localStorageKeys, StorageHelper } from "../../../../_shared/helpers";
import { getAppSettings } from "../../../../_shared/app-settings";
import { LobbySocketConnection } from "../../lobby/lobby-socket-connection";
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { reCheckIn } from "../../../../services/auth-service";
import { ReCheckInResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../../../_shared/helpers/message-transmitter/global-transmitter";

export class NotificationHandler {
    private readonly reCheckInInterval: NodeJS.Timeout;

    public isKickOut = false;
    public readonly lobbyConnection: LobbySocketConnection;
    public notificationSocket: Socket = null;

    constructor(
        private readonly session: SSOResponse,
        private readonly setIsUm: Function,
        private readonly showApiErrorMessage: Function,
        private readonly signOut: Function) {
        this.lobbyConnection = new LobbySocketConnection();

        this.connectNotificationSocket();
        this.reCheckInInterval = setInterval(async () => {
            const reCheckInResponse = await reCheckIn(session);
            this.handleRecheckInResponse(reCheckInResponse);
        }, 60 * 1000);
    }

    connectNotificationSocket() {
        const { proxy, enableMsgpackParser } = getAppSettings();

        const socketUri = buildUrl();
        const socketOption = {
            forceNew: false,
            transports: ["websocket"],
            upgrade: false,
            auth: {
                ss: this.session.ss,
                username: this.session.username,
            },
            path: `${proxy.path}/notification/socket.io`,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };

        this.notificationSocket = io(socketUri, socketOption);
        this.registerNotificationSocketEvent();
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

    registerNotificationSocketEvent() {
        this.notificationSocket.on("auth", this.handleAuth);
        this.notificationSocket.on("kickedOut", this.handleKickedOut);
        this.notificationSocket.on("reload", this.handleReload);
    }

    handleAuth = (data: { authorized: boolean }) => {
        if (!data.authorized) {
            this.handleKickedOut(data);
        }
    }

    handleKickedOut = (data: any) => {
        const { umInfo } = data;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            StorageHelper.set(localStorageKeys.umInfo, umInfo);
            setTimeout(() => {
                this.setIsUm(true);
            }, 500);
        } else {
            this.signOut();
        }
    }

    handleReload() {
        globalThis.location.reload();
    }

    async handleReCheckIn() {
        const reCheckInResponse = await reCheckIn(this.session);
        this.handleRecheckInResponse(reCheckInResponse);
    }


    reset() {
        this.notificationSocket?.close();
        clearInterval(this.reCheckInInterval);
    }
}
