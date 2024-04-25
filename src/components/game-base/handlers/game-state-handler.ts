import { GameEventAction, GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../type";

type GameStateHandlerProps = {
    gameStateContextModel: GameStateContextModel;
    nextRoundState: RoundState;
    durations: GameDurations;
    defaultResult: any;
    defaultSettlementResult: any;
    remainingTime: number;
};

export interface IGameStateHandler {
    getNextRoundState({
        gameStateContextModel,
        nextRoundState,
        durations,
        defaultResult,
        defaultSettlementResult,
        remainingTime,
    }: GameStateHandlerProps);
    setReturnToGameState(dispatch: (action: GameEventAction) => {});
}

export class GameStateHandler implements IGameStateHandler {
    protected shouldIncreaseRoundId({ nextRoundState, durations }: { nextRoundState: RoundState; durations: GameDurations }): boolean {
        return false;
    }

    getNextRoundState({
        gameStateContextModel,
        nextRoundState,
        durations,
        defaultResult,
        defaultSettlementResult,
        remainingTime
    }: GameStateHandlerProps) {
        if (gameStateContextModel) {
            const { result, settlementResult, roundId } = gameStateContextModel;

            const newStateDetector = [
                {
                    condition: nextRoundState === RoundState.InRound,
                    state: { betWin: 0 },
                },
                {
                    condition: [RoundState.SwitchRound, RoundState.BeforePlaceBet, RoundState.InRound].includes(nextRoundState),
                    state: {
                        ownBets: {},
                        totalBets: {},
                        showWinningAnimation: false,
                        isShowBlink: false,
                        playResultAnimation: false,
                        showResultInfo: false,
                    },
                },
                {
                    condition: [RoundState.SwitchRound].includes(nextRoundState),
                    state: {roundData: {}},
                },
                {
                    condition: this.shouldIncreaseRoundId({ nextRoundState, durations }),
                    state: { roundId: roundId + 1 },
                },
                {
                    condition: nextRoundState === RoundState.LockingBet,
                    state: {
                        isShowBlink: true,
                        result: defaultResult ?? result,
                        settlementResult: defaultSettlementResult ?? settlementResult,
                        notConfirmOwnBets: {},
                        showConfirmBet: false,
                        showConfirmDialog: false,
                    },
                },
            ];

            return newStateDetector.reduce(
                (newState, stateDetector) => {
                    if (stateDetector.condition) {
                        newState = Object.assign(newState, stateDetector.state);
                    }
                    return newState;
                },
                {
                    remainingTime: this.getTimeCounter({
                        remainingTime,
                        durations: durations,
                        roundState: nextRoundState,
                    }),
                }
            );
        }
    }

    setReturnToGameState(dispatch: (action: GameEventAction) => {}) {
        const returnToGameState = {
            ownBets: {},
            totalBets: {},
            showConfirmBet: false,
            showConfirmDialog: false,
            suggestBet: {},
        };

        dispatch({
            type: GameEventActionType.SET_NEW_GAME_STATE,
            payload: { newGameState: returnToGameState },
        });
    }

    private getTimeCounter({
        remainingTime,
        durations,
        roundState,
    }: {
        remainingTime: number;
        durations: GameDurations;
        roundState: RoundState;
    }): number {
        switch (roundState) {
            case RoundState.InRound:
            case RoundState.LockingBet:
                return remainingTime;
            case RoundState.BeforePlaceBet:
                return durations.beforePlaceBet;
            default:
                return 0;
        }
    }
}
