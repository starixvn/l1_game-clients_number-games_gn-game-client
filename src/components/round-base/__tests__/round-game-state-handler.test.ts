import { GameDurations, RoundState } from "../../game-base/type";
import { RoundGameStateHandler } from "../round-game-state-handler";

describe("RoundGameStateHandler", () => {
    let handler: RoundGameStateHandler;
    let durations: GameDurations;

    beforeEach(() => {
        handler = new RoundGameStateHandler();
        durations = { showResult: 9, beforePlaceBet: 1, placingBets: 25, lockingBet: 3, wholeRound: 35, resultAnimation: 5 };
    });

    describe("shouldIncreaseRoundId", () => {
        it("returns true when durations.beforePlaceBet is true and nextRoundState is RoundState.BeforePlaceBet", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.BeforePlaceBet,
                durations: { beforePlaceBet: true },
            });
            expect(result).toBe(true);
        });

        it("returns false when durations.beforePlaceBet is true and nextRoundState is not RoundState.BeforePlaceBet", () => {
            const result = handler.shouldIncreaseRoundId({ nextRoundState: RoundState.InRound, durations: { beforePlaceBet: true } });
            expect(result).toBe(false);
        });

        it("returns true when durations.beforePlaceBet is false and nextRoundState is RoundState.InRound", () => {
            const result = handler.shouldIncreaseRoundId({ nextRoundState: RoundState.InRound, durations: { beforePlaceBet: false } });
            expect(result).toBe(true);
        });

        it("returns false when durations.beforePlaceBet is false and nextRoundState is not RoundState.InRound", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.BeforePlaceBet,
                durations: { beforePlaceBet: false },
            });
            expect(result).toBe(false);
        });
    });
});
