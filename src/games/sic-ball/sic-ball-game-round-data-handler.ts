import { GameRoundDataHandler } from "../../components/game-base/handlers/game-round-data-handler";

export class NextGameRoundDataHandler extends GameRoundDataHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, drawId: number) {
        const resultRoundData = {
            balls: [result.balls],
        };

        return {
            balls: previousRoundData?.balls?.concat(resultRoundData.balls) || resultRoundData.balls,
            drawId,
        };
    }
}
