import { ILobbyContextModel } from "./lobby-context-model";

export enum LobbyEventActionType {
    LOBBY_CONFIGS = "LOBBY_CONFIGS",
}

export interface SettingEventAction {
    type: LobbyEventActionType;
    payload?: ILobbyContextModel;
}
