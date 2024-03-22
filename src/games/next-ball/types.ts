export type NextBallSettlementResult = {
    over: boolean;
    under: boolean;
    odd: boolean;
    even: boolean;
    drawId: number;
};

export type NextBallResult = {
    over?: number;
    under?: number;
    odd?: number;
    even?: number;
    drawId?: number;
};

export type Odd = {};
