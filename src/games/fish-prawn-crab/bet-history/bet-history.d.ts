import { Result, SettlementResult, Odd } from "../fish-prawn-crab";
import { BetLogsBase } from "../../../shared/game-base/type";

export interface BetLogs extends BetLogsBase<Result, SettlementResult, Odd> {
    crab: number;
    fish: number;
    gourd: number;
    prawn: number;
    rooster: number;
    stag: number;
}
