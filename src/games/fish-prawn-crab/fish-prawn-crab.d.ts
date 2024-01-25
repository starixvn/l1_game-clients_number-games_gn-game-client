export interface SettlementResult {
    crab: boolean;
    fish: boolean;
    gourd: boolean;
    prawn: boolean;
    rooster: boolean;
    stag: boolean;
}

export interface Result {
    dice1: number;
    dice2: number;
    dice3: number;
}

export enum BaseResult {
    stag,
    gourd,
    rooster,
    fish,
    crab,
    prawn,
}

export interface ResultStatistic {
    result: BaseResult[];
}

export type Odd = {
    single: number;
    double: number;
    triple: number;
};
