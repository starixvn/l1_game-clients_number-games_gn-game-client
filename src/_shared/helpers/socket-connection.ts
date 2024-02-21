import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { SocketInfo } from "./../../components/game-base/type";
import { GameMessageHandler, messageEventType } from "../../components/game-base/game-message-handler";

export function InitSocketIO(socketInfo: SocketInfo, session: any, gameName: string, gameMessageHandler: GameMessageHandler) {
    const { proxy, enableMsgpackParser } = getAppSettings();
    const socketUri = buildServerUrl(socketInfo.namespace);
    const socketOption = {
        forceNew: true,
        transports: ["websocket"],
        path: `${proxy.path}/${socketInfo.path}/socket.io`,
        upgrade: false,
        parser: enableMsgpackParser ? MsgpackParser : undefined,
    };

    const socket = io(socketUri, socketOption);

    if (socket) {
        gameMessageHandler.registerSocketEvents();

        socket.off(gameName).on(gameName, gameMessageHandler.broadcastGameMessage);
        socket.off("message").on("message", (message) => {
            if (message[messageEventType.USER_STAKE_LEVEL]) {
                gameMessageHandler.broadcastGameMessage({ ...message, hasNotice: false });
            } else {
                gameMessageHandler.broadcastGameMessage(message);
            }
        });

        socket.on("connect", () => {
            socket.emit("signin", session);
            gameMessageHandler.broadcastGameMessage({ connect: true });
        });

        socket.on("signedIn", () => {
            socket.emit("inGame", gameName);
            gameMessageHandler.broadcastGameMessage({ signedIn: true });
        });

        socket.on("connect_error", () => {
            gameMessageHandler.broadcastGameMessage({ connect_error: true });
        });
        socket.on("disconnect", () => {
            gameMessageHandler.broadcastGameMessage({ disconnect: true });
        });
    }

    return { socket };
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
