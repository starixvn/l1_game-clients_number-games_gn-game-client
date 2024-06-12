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

export const sicBallChoicesMapper = { specific1: 1, specific2: 2, specific3: 3, specific4: 4, specific5: 5, specific6: 6 };

export type Odd = {};
