import React from "react";
import { Socket } from "socket.io-client";
import { LobbyGameTransmitter } from "../../../components/page-components/lobby/lobby-socket-connection";

export type LobbyConnectionContextModel = {
    socket: Socket;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    removeGameTransmitter?: (gameId: number) => void;
    reconnectGameTransmitter?: (gameId: number) => LobbyGameTransmitter;
};

export const LobbyConnectionContext = React.createContext<LobbyConnectionContextModel>({ socket: null, gameTransmitters: {} });
LobbyConnectionContext.displayName = "LobbyConnectionContext";

export const LobbyConnectionContextProvider = LobbyConnectionContext.Provider;
export const LobbyConnectionContextConsumer = LobbyConnectionContext.Consumer;
export const useLobbyConnectionContext = () => React.useContext(LobbyConnectionContext);
