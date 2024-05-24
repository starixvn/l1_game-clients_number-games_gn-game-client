export type LuckyThreeSettlementResult = {
    drawId: number;
    over: boolean;
    under: boolean;
    red2: boolean;
    red3: boolean;
    blue2: boolean;
    blue3: boolean;
};

export type LuckyThreeResult = {
    balls: number[];
    drawId: number;
    time: string;
};

export type Odd = {};
