import { GameRoundDataHandler } from "../../components/game-base/handlers/game-round-data-handler";

export class BacBallGameRoundDataHandler extends GameRoundDataHandler {
    buildGameRoundDataAfterReceiveFinishEvent(previousRoundData: any, result: any, drawId: number) {
        const resultRoundData = {
            bankerBalls: [result.banker],
            playerBalls: [result.player],
        };

        return {
            bankerBalls: previousRoundData?.bankerBalls?.concat(resultRoundData.bankerBalls) || resultRoundData.bankerBalls,
            playerBalls: previousRoundData?.playerBalls?.concat(resultRoundData.playerBalls) || resultRoundData.playerBalls,
            drawId,
        };
    }
}
