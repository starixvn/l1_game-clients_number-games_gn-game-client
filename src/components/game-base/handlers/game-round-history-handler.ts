import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../type";

export type GameRoundHistorydHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel;
};

export class GameRoundHistoryHandler {
    constructor(private props: GameRoundHistorydHandlerProps) {}

    handleRoundHistory({ roundHistory, roundId }) {
        const { roundState, isUMInFirstLoad } = this.props.gameStateContextModel();

        this.props.dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                settlementResult: roundState === RoundState.LockingBet ? {} : roundHistory[0]?.settlementResult,
                playResultAnimation: false,
                showResultInfo: isUMInFirstLoad,
            },
        });
    }
}
