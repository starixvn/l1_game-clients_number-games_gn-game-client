import { RoundState } from "../../game-base/type";
import { TurnGameStateHandler } from "../turn-game-state-handler";

describe("TurnStateHandler", () => {
    let handler: TurnGameStateHandler;

    beforeEach(() => {
        handler = new TurnGameStateHandler();
    });

    describe("shouldIncreaseRoundId", () => {
        it("should return true when nextRoundState is SwitchRound and durations.switchRoundAnimation is > 0", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: 1,
                },
            });
            expect(result).toBe(true);
        });

        it("should return false when nextRoundState is not SwitchRound and durations.switchRoundAnimation is > 0", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.InRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: 1,
                },
            });
            expect(result).toBe(false);
        });


        it("should return false when nextRoundState is SwitchRound and durations.switchRoundAnimation is undefined", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                },
            });
            expect(result).toBe(false);
        });

        it("should return false when nextRoundState is SwitchRound and durations.switchRoundAnimation is 0", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: 0,
                },
            });
            expect(result).toBe(false);
        });

        it("should return false when nextRoundState is SwitchRound and durations.switchRoundAnimation is null", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: null,
                },
            });
            expect(result).toBe(false);
        });

        it("should return true when nextRoundState is InRound and durations.switchRoundAnimation is 0", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.InRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: 0,
                },
            });
            expect(result).toBe(true);
        });

        it("should return true when nextRoundState is InRound and durations.switchRoundAnimation is null", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.InRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                    switchRoundAnimation: null,
                },
            });
            expect(result).toBe(true);
        });

        it("should return true when nextRoundState is InRound and durations.switchRoundAnimation is undefined", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.InRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                },
            });
            expect(result).toBe(true);
        });

        it("should return false when nextRoundState is not InRound and durations.switchRoundAnimation is undefined", () => {
            const result = handler.shouldIncreaseRoundId({
                nextRoundState: RoundState.SwitchRound,
                durations: {
                    wholeRound: 112,
                    wholeTurn: 27,
                    placingBets: 20,
                    lockingBet: 3,
                    showResult: 7,
                    resultAnimation: 3,
                    beforePlaceBet: 0,
                },
            });
            expect(result).toBe(false);
        });
    });
});
