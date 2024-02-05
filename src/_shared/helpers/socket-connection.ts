import { SocketInfo } from "./../../components/game-base/type";
import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";

export function initSocketIO(socketInfo: SocketInfo) {
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

    return socket;
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
