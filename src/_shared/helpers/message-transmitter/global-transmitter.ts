import messageTransmitter from ".";

export const GlobalMessageTransmitter = messageTransmitter();

export enum GlobalTransmitterEvent {
    BACK_TO_LOBBY =  "backToLobby",
    OPEN_GAME_ID = "openingGameId",
    NOTICE = "notice",
    USER_INFO_RED  = "userInfoRed"
}

export const registerGlobalMessageEvent = (messageKey: string, handler: Function) => {
    GlobalMessageTransmitter.register(messageKey, handler);
};

export const unsubscribeGlobalMessageEvent = (listenerId: string) => {
    GlobalMessageTransmitter.unsubscribe(listenerId);
};