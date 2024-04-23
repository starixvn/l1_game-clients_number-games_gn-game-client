import messageTransmitter from ".";

export const GlobalMessageTransmitter = messageTransmitter();

export const registerGlobalMessageEvent = (messageKey: string, handler: Function) => {
    GlobalMessageTransmitter.register(messageKey, handler);
};

export const unsubscribeGlobalMessageEvent = (listenerId: string) => {
    GlobalMessageTransmitter.unsubscribe(listenerId);
};