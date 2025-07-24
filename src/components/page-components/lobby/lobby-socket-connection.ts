import { Socket, io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../../../_shared/app-settings";
import { buildUrl } from "../../../_shared/helpers/url-helper";
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

export const LobbyMessageEvents = {
    REMAINING_TIME: "remainingTime",
    START_PLACE_BET: "spb",
    FINISH: "finish",
    SIGNED_IN: "signedIn",
    UM: "um",
    START_NEW_ROUND: "snr",
    ERRORCODE: "errorCode",
    SHOW_DATA: "showData",
    PLAYERS: "players",
    PLAYER: "player",
    OUTGAME: "outgame",
    ROUND_HISTORY: "roundHistory",
    END_PLACE_BET: "epb",
};

export class LobbySocketConnection {
    socket: Socket;
    gameTransmitters: Record<number, LobbyGameTransmitter> = {};
    offerGameIds: number[] = [];

    initLobbySocket(session: any, offerGameIds: number[]) {
        this.offerGameIds = offerGameIds;

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
                    this.offerGameIds?.forEach((gameId) => {
                        this.signInGame(session, gameId);
                        this.initGameTransmitter(gameId);
                    });
                    resolve(socket);
                });

                socket.on(messageEventType.SOCKET_CONNECT_ERROR, () => {
                    resolve(socket);
                });
                socket.on(messageEventType.SOCKET_DISCONNECTED, () => {
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
            !this.offerGameIds.includes(gameId) && this.offerGameIds.push(gameId);
            this.registerGameEvents(gameId);
        }
        return this.gameTransmitters[gameId];
    }

    signInGame(session: any, gameId: number) {
        if (!this.socket || !session) {
            return;
        }
        const receivedEvents = Object.values(LobbyMessageEvents);
        const gameSetting = this.getGameSettings(gameId);
        if (gameSetting) {
            const serviceName = gameSetting.socketInfo?.serviceName;
            const appMini = 3;
            this.socket.emit("signIn", {
                gameName: gameSetting.gameName,
                session: { ...session, system: appMini },
                serviceName,
                receivedEvents,
            });
        }
    }

    private getGameSettings(gameId: number) {
        const { gameSettings } = getAppSettings();
        return gameSettings[gameId];
    }

    private registerGameEvents(gameId: number) {
        const listenerIds = [];
        listenerIds.push(
            this.gameTransmitters[gameId]?.register(LobbyMessageEvents.SIGNED_IN, ({ signedIn }) => this.handleSignedIn(gameId, signedIn))
        );
        listenerIds.push(
            this.gameTransmitters[gameId]?.register(LobbyMessageEvents.ERRORCODE, ({ errorCode }) =>
                this.handleGameDisconnect(gameId, errorCode)
            )
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
        this.offerGameIds = this.offerGameIds.filter((id) => id !== gameId);
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
