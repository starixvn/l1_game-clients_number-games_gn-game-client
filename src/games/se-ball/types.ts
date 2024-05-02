export type SeBallSettlementResult = {
    drawId: number;
    odd: boolean;
    even: boolean;
    red3: boolean;
    red4: boolean;
    blue3: boolean;
    blue4: boolean;
    red2: boolean;
};

export type SeBallResult = {
    ball: number;
    drawId: number;
    time: string;
};

export type Odd = {};
