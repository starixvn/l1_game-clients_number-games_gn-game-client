import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../type";

export type GameRoundHistorydHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
};

export class GameRoundHistoryHandler {
    constructor(private readonly props: GameRoundHistorydHandlerProps) { }

    handleRoundHistory({ roundHistory, roundId, newRoundState }) {
        const { roundState, isUMInFirstLoad } = this.props.gameStateContextModel();
        let verifiedRoundState = roundState;

        if (verifiedRoundState === RoundState.None) {
            verifiedRoundState = newRoundState;
        }

        console.log(`GameRoundHistoryHandler: ${RoundState[verifiedRoundState]} `);

        this.props.dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(verifiedRoundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                settlementResult: verifiedRoundState === RoundState.LockingBet ? {} : roundHistory[0]?.settlementResult,
                playResultAnimation: false,
                showResultInfo: [RoundState.DisplayResult].includes(verifiedRoundState) || isUMInFirstLoad ? true : false,
            },
        });
    }
}
