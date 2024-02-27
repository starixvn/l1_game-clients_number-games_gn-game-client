export type BacBallSettlementResult = {
    banker: boolean;
    drawId: number;
    player: boolean;
    tie: boolean;
};

export type BacBallResult = {
    player?: number;
    banker?: number;
    drawId?: number;
};

export type Odd = {};
