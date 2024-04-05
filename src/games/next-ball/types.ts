export type NextBallSettlementResult = {
    over: boolean;
    under: boolean;
    odd: boolean;
    even: boolean;
    drawId: number;
};

export type NextBallResult = {
    ball: number;
    drawId: number;
    time: string;
};

export type Odd = {};
