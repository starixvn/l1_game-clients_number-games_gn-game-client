import { GameDurations, RoundState } from "../../game-base/type";
import { TurnStateHandler } from "../turn-state-handler";

describe("TurnStateHandler", () => {
    let handler: TurnStateHandler;
    let durations: GameDurations;

    beforeEach(() => {
        handler = new TurnStateHandler();
        durations = {
            showResult: 9,
            beforeStartRound: 1,
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

    describe("getWholeRoundDuration", () => {
        it("should return the wholeTurn duration from durations", () => {
            const duration = handler.getWholeRoundDuration({ durations });
            expect(duration).toEqual(durations.wholeTurn);
        });
    });

    describe("shouldCountDownTimer", () => {
        it("should return true if newRoundState is not SwitchRound", () => {
            const shouldCount = handler.shouldCountDownTimer({ newRoundState: RoundState.InRound });
            expect(shouldCount).toBe(true);
        });

        it("should return false if newRoundState is SwitchRound", () => {
            const shouldCount = handler.shouldCountDownTimer({ newRoundState: RoundState.SwitchRound });
            expect(shouldCount).toBe(false);
        });
    });
});
