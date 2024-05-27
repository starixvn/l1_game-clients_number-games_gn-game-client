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
        it("returns true when nextRoundState is InRound", () => {
            const result = handler.shouldIncreaseRoundId({ nextRoundState: RoundState.InRound });
            expect(result).toBe(true);
        });
    });
});
