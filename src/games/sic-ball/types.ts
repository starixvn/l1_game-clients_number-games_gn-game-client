export type SicBallSettlementResult = {
    drawId: number;
    big: boolean;
    small: boolean;
    specific1: boolean;
    specific2: boolean;
    specific3: boolean;
    specific4: boolean;
    specific5: boolean;
    specific6: boolean;
};

export type SicBallResult = {
    balls: number[];
    drawId: number;
    time: string;
};

export type Odd = {};
