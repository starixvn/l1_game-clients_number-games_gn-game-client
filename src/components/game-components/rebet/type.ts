import {Notice} from "../../game-base/type";
export interface Props {
    gameId: number;
    onCloseModal: Function;
    getOddsByChoice: Function;
}

export interface BetTrackModel {
    messages?: Notice;
    state: BetState;
    validAmount?: number;
}

export enum BetState {
    Waiting,
    Success,
    Error,
}
