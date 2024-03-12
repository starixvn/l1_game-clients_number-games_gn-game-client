import { GameDurations, RoundState } from "../../game-base/type";
import { TurnGameStateHandler } from "../turn-game-state-handler";

describe("TurnStateHandler", () => {
    let handler: TurnGameStateHandler;

    beforeEach(() => {
        handler = new TurnGameStateHandler();
    });

    describe("shouldIncreaseRoundId", () => {
        it("should return true when nextRoundState is SwitchRound and durations.switchRoundAnimation is true", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: { switchRoundAnimation: true },
            });
            expect(result).toBe(true);
        });

        it("should return false when nextRoundState is SwitchRound and durations.switchRoundAnimation is false", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: { switchRoundAnimation: false },
            });
            expect(result).toBe(false);
        });

        it("should return false when nextRoundState is not SwitchRound and durations.switchRoundAnimation is true", () => {
            const result = handler.shouldIncreaseRoundId({ nextRoundState: RoundState.InRound, durations: { switchRoundAnimation: true } });
            expect(result).toBe(false);
        });

        it("should return true when nextRoundState is not SwitchRound and durations.switchRoundAnimation is false", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.InRound,
                durations: { switchRoundAnimation: false },
            });
            expect(result).toBe(true);
        });
    });
});
