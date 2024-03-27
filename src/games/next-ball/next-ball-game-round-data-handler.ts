import { GameRoundDatatHandler } from "../../components/game-base/handlers/game-round-data-handler";

export class NextGameRoundDatatHandler extends GameRoundDatatHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, drawId: number) {
        const resultRoundData = {
            balls: [result.ball],
        };

        return {
            balls: previousRoundData?.balls?.concat(resultRoundData.balls) || resultRoundData.balls,
            drawId,
        };
    }
}
