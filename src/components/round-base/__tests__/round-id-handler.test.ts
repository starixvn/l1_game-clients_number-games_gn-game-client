import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { RoundIdHandler } from "../round-id-handler";

describe(RoundIdHandler.name, () => {
    describe("handleRoundId", () => {
        it("should set round id", () => {
            // arrange
            const dispatch = jest.fn();
            const handler = new RoundIdHandler({ dispatch } as any, {} as any);
            handler["isFirstRoundId"] = false;

            // act
            handler.handleRoundId({ roundId: 10 });

            // assert
            expect(dispatch).toHaveBeenCalledWith({ type: GameEventActionType.ROUND_ID, payload: { roundId: 10 } });
        });
    });
});
