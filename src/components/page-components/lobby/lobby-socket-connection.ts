import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../../../_shared/app-settings";
import { messageEventType } from "../../game-base/handlers";

export function initLobbySocket(session: any, offerGameIds: number[]) {
    const { proxy, enableMsgpackParser, gameSettings } = getAppSettings();
    const socketUri = "https://gn-proxy.lumigame.com";
    const socketOption = {
        forceNew: true,
        transports: ["websocket"],
        path: `${proxy.path}/gateway/socket.io`,
        upgrade: false,
        parser: enableMsgpackParser ? MsgpackParser : undefined,
    };
    const socket = io(socketUri, socketOption);
    if (socket) {
        socket.on(messageEventType.SOCKET_CONNECTED, () => {
            offerGameIds.forEach((gameId) => {
                const gameSetting = gameSettings[gameId];
                if (gameSetting) {
                    const serviceName = gameSetting.socketInfo?.serviceName;
                    socket.emit("signIn", { gameName: gameSetting.gameName, session, serviceName });
                }
            });
        });

        socket.on(messageEventType.SOCKET_CONNECT_ERROR, () => {
            console.log("error");
        });
        socket.on(messageEventType.SOCKET_DISCONNECTED, () => {
            console.log("disconnect");
        });
    }
    return socket;
}
