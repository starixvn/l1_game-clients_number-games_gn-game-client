import { Socket } from "socket.io-client";
import MessageTransmitter from "../../../../_shared/helpers/message-transmitter";

export const initLobbyGameTransmitter = (socket: Socket, gameName: string) => {
    const messageTransmitter = MessageTransmitter();
    console.log(`on send ${gameName}`);
    socket.on(gameName, messageTransmitter.broadcast);
    return messageTransmitter;
};
