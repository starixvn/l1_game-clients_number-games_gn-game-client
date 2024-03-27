import { Socket, io } from "socket.io-client";
import { getAppSettings } from "../../../_shared/app-settings";
import { buildUrl } from "../../../_shared/helpers";
import MsgpackParser from "socket.io-msgpack-parser";
import { messageEventType } from "../../game-base/handlers";
import { initLobbyGameTransmitter } from "./games/lobby-game-transmitter";

export type LobbyGameTransmitter = {
    register: (messageKey: string, handleMessage: Function) => string;
    broadcast: (message: any) => void;
    unsubscribe: (listenerId: string) => void;
    clearAllListener: () => void;
    signedIn?: boolean;
    listenerIds?: string[];
};

export class LobbySocketConnection {
    socket: Socket;
    gameTransmitters: Record<number, LobbyGameTransmitter> = {};
    initLobbySocket(session: any, offerGameIds: number[]) {
        const { proxy, enableMsgpackParser, socketGatewayPath } = getAppSettings();
        const socketUri = buildUrl();
        const socketOption = {
            forceNew: true,
            transports: ["websocket"],
            path: `${proxy.path}/${socketGatewayPath}/socket.io`,
            upgrade: false,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };
        return new Promise<Socket>((resolve) => {
            const socket = io(socketUri, socketOption);
            if (socket) {
                socket.on(messageEventType.SOCKET_CONNECTED, () => {
                    offerGameIds?.forEach((gameId) => {
                        this.signInGame(session, gameId);
                        this.initGameTransmitter(gameId);
                    });
                    resolve(socket);
                });

                socket.on(messageEventType.SOCKET_CONNECT_ERROR, () => {
                    console.log("error");
                    resolve(socket);
                });
                socket.on(messageEventType.SOCKET_DISCONNECTED, () => {
                    console.log("disconnect");
                    resolve(socket);
                });
            }
            this.socket = socket;
        });
    }

    initGameTransmitter(gameId: number) {
        const { gameSettings } = getAppSettings();
        const gameSetting = gameSettings[gameId];
        if (gameSetting) {
            this.gameTransmitters[gameId] = initLobbyGameTransmitter(this.socket, gameSetting.gameName);
            this.registerGameEvents(gameId);
        }
        return this.gameTransmitters[gameId];
    }

    signInGame(session: any, gameId: number) {
        if (!this.socket || !session) {
            return;
        }

        const gameSetting = this.getGameSettings(gameId);
        if (gameSetting) {
            const serviceName = gameSetting.socketInfo?.serviceName;
            const appMini = 3;
            this.socket.emit("signIn", { gameName: gameSetting.gameName, session: { ...session, system: appMini }, serviceName });
        }
    }

    private getGameSettings(gameId: number) {
        const { gameSettings } = getAppSettings();
        return gameSettings[gameId];
    }

    private registerGameEvents(gameId: number) {
        const listenerIds = [];
        listenerIds.push(this.gameTransmitters[gameId]?.register("signedIn", ({ signedIn }) => this.handleSignedIn(gameId, signedIn)));
        listenerIds.push(
            this.gameTransmitters[gameId]?.register("errorCode", ({ errorCode }) => this.handleGameDisconnect(gameId, errorCode))
        );
        this.gameTransmitters[gameId].listenerIds = listenerIds;
    }

    private handleSignedIn(gameId: number, signedIn: boolean) {
        this.gameTransmitters[gameId] && (this.gameTransmitters[gameId].signedIn = signedIn);
    }

    private handleGameDisconnect(gameId: number, errorCode: string) {
        const failedConnectionErrorCode = "SB0010";
        if (errorCode === failedConnectionErrorCode) {
            this.unsubscribeGame(gameId);
        }
    }

    closeSocket() {
        this.clearAllGameTransmitters();
        this.socket?.close();
    }

    private clearAllGameTransmitters() {
        Object.values(this.gameTransmitters)?.forEach((transmitter) => {
            transmitter?.clearAllListener();
        });
        this.gameTransmitters = {};
    }

    unsubscribeGame(gameId: number) {
        const transmitter = this.gameTransmitters[gameId];
        transmitter?.listenerIds?.forEach((id) => transmitter.unsubscribe(id));
        this.gameTransmitters[gameId] = null;
    }

    getSocket() {
        return this.socket;
    }

    getTransmitters() {
        return this.gameTransmitters;
    }
}

export function getLobbyData(socket: Socket, gameId: number) {
    const { gameSettings } = getAppSettings();
    const gameSetting = gameSettings[gameId];
    socket?.emit("getLobbyData", { gameName: gameSetting?.gameName });
}
