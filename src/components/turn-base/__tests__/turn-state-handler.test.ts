import { GameDurations, RoundState } from "../../game-base/type";
import { TurnStateHandler } from "../turn-state-handler";

describe("TurnStateHandler", () => {
    let handler: TurnStateHandler;
    let durations: GameDurations;

    beforeEach(() => {
        handler = new TurnStateHandler();
        durations = {
            showResult: 9,
            beforePlaceBet: 1,
            placingBets: 25,
            lockingBet: 3,
            wholeTurn: 35,
            wholeRound: 142,
            switchRoundAnimation: 2,
            resultAnimation: 3,
        };
    });

    describe("determineRoundBaseState", () => {
        it.each([131, 132])(
            "should return SwitchRound if roundRemainingTime is within the switch round animation period",
            (roundRemainingTime) => {
                const roundState = handler.determineRoundBaseState({ wholeRound: 142, remainingTime: 34, durations, roundRemainingTime });
                expect(roundState).toBe(RoundState.SwitchRound);
            }
        );
    });

    // describe("getRemainingTime", () => {
    //     it("returns correct remaining time when remainingTime is greater than endSwitchRoundPointTime", () => {
    //         const remainingTime = 140;
    //         const expected = 5;
    //         const result = handler.getRemainingTime({ remainingTime, durations });
    //         expect(result).toBe(expected);
    //     });

    //     // it("returns correct remaining time when remainingTime is less than endSwitchRoundPointTime", () => {
    //     //     const remainingTime = 50;
    //     //     const expected = 40; // 50 % 60
    //     //     const result = handler.getRemainingTime({ remainingTime, durations });
    //     //     expect(result).toBe(expected);
    //     // });

    //     // it("adjusts remaining time correctly when remainingTime is on the edge of endSwitchRoundPointTime", () => {
    //     //     const remainingTime = 70; // endSwitchRoundPointTime is 70 (100 - 20 - 10)
    //     //     const expected = 60; // Since it's exactly at the endSwitchRoundPointTime, it should subtract switchRoundAnimation and wrap around
    //     //     const result = handler.getRemainingTime({ remainingTime, durations });
    //     //     expect(result).toBe(expected);
    //     // });

    //     // it("returns wholeTurn when the calculated remaining time is less than or equal to 0", () => {
    //     //     const remainingTime = 20; // This would result in a negative or 0 remaining time
    //     //     const expected = 60; // wholeTurn
    //     //     const result = handler.getRemainingTime({ remainingTime, durations });
    //     //     expect(result).toBe(expected);
    //     // });

    //     // it("handles remainingTime exactly equal to wholeTurn correctly", () => {
    //     //     const remainingTime = 60; // Exactly wholeTurn
    //     //     const expected = 50; // Should subtract switchRoundAnimation because it's greater than endSwitchRoundPointTime
    //     //     const result = handler.getRemainingTime({ remainingTime, durations });
    //     //     expect(result).toBe(expected);
    //     // });
    // });

    describe("getWholeRoundDuration", () => {
        it("should return the wholeTurn duration from durations", () => {
            const wholeRoundDuration = handler.getWholeRoundDuration({ durations });
            expect(wholeRoundDuration).toEqual(durations.wholeTurn);
        });
    });

    describe("shouldCountDownTimer", () => {
        it.each([RoundState.InRound, RoundState.LockingBet, RoundState.BeforePlaceBet, RoundState.DisplayResult])(
            "should return true if newRoundState is not SwitchRound",
            (newRoundState) => {
                const shouldCount = handler.shouldCountDownTimer({ newRoundState });
                expect(shouldCount).toBe(true);
            }
        );

        it("should return false if newRoundState is SwitchRound", () => {
            const shouldCount = handler.shouldCountDownTimer({ newRoundState: RoundState.SwitchRound });
            expect(shouldCount).toBe(false);
        });
    });
});
