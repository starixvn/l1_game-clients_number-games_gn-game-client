import { GameBaseState } from "../../components/game-base/type";

export type SettlementResult = {
    banker: boolean;
    drawId: number;
    player: boolean;
    tie: boolean;
};

export type Result = {
    player: number;
    banker: number;
    drawId: number;
};

export type Odd = {};

export interface BacBallState<Result, SettlementResult> extends GameBaseState<any, any> {}
