import { BetLogsBase } from "../../../components/shared/game-base/type";
import { Result, SettlementResult, Odd } from "../fish-prawn-crab";

export interface BetLogs extends BetLogsBase<Result, SettlementResult, Odd> {
    crab: number;
    fish: number;
    gourd: number;
    prawn: number;
    rooster: number;
    stag: number;
}
