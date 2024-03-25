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
        signInGame(this.socket, session, gameId);
    }

    registerGameEvents(gameId: number) {
        this.gameTransmitters[gameId]?.register("errorCode", ({ errorCode }) => {
            const failedConnectionErrorCode = "SB0010";
            if (errorCode === failedConnectionErrorCode) {
                this.unsubscribeGame(gameId);
            }
        });
        this.gameTransmitters[gameId]?.register("signedIn", ({ signedIn }) => {
            this.gameTransmitters[gameId] && (this.gameTransmitters[gameId].signedIn = signedIn);
        });
    }

    closeSocket() {
        this.clearAllGameTransmitters();
        this.socket?.close();
    }

    clearAllGameTransmitters() {
        Object.values(this.gameTransmitters)?.forEach((transmitter) => {
            transmitter?.clearAllListener();
        });
        this.gameTransmitters = {};
    }

    unsubscribeGame(gameId: number) {
        this.gameTransmitters[gameId]?.clearAllListener();
        this.gameTransmitters[gameId] = null;
    }

    getSocket() {
        return this.socket;
    }

    getTransmitters() {
        return this.gameTransmitters;
    }
}

export function signInGame(socket: Socket, session: any, gameId: number) {
    if (!socket || !session) {
        return;
    }
    const { gameSettings } = getAppSettings();
    const gameSetting = gameSettings[gameId];
    if (gameSetting) {
        const serviceName = gameSetting.socketInfo?.serviceName;
        const appMini = 3;
        socket.emit("signIn", { gameName: gameSetting.gameName, session: { ...session, system: appMini }, serviceName });
    }
}

export function getLobbyData(socket: Socket, gameId: number) {
    const { gameSettings } = getAppSettings();
    const gameSetting = gameSettings[gameId];
    socket?.emit("getLobbyData", { gameName: gameSetting?.gameName });
}
