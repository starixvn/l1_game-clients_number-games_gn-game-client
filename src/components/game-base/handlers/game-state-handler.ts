import { RoundState } from "../type";

export interface IGameStateHandler {
    getNextRoundState({ gameStateContextModel, nextRoundState, durations, defaultResult, defaultSettlementResult, remainingTime });
}

export class GameStateHandler implements IGameStateHandler {
    protected shouldIncreaseRoundId({ nextRoundState, durations }): boolean {
        return false;
    }

    getNextRoundState({ gameStateContextModel, nextRoundState, durations, defaultResult, defaultSettlementResult, remainingTime }) {
        if (gameStateContextModel) {
            const { notice, result, settlementResult, roundId } = gameStateContextModel;

            const newStateDetector = [
                {
                    condition: nextRoundState === RoundState.InRound,
                    state: { betWin: 0 },
                },
                {
                    condition: [RoundState.BeforeStartRound, RoundState.InRound].includes(nextRoundState),
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
                    condition: this.shouldIncreaseRoundId({ nextRoundState, durations }),
                    state: { roundId: roundId + 1 },
                },
                {
                    condition: nextRoundState === RoundState.LockingBet,
                    state: {
                        isShowBlink: true,
                        notice,
                        result: defaultResult ?? result,
                        settlementResult: defaultSettlementResult ?? settlementResult,
                        notConfirmOwnBets: {},
                        showConfirmBet: false,
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

    private getTimeCounter({ remainingTime, durations, roundState }): number {
        switch (roundState) {
            case RoundState.InRound:
            case RoundState.LockingBet:
                return remainingTime;
            case RoundState.BeforeStartRound:
                return durations.beforeStartRound;
            default:
                return 0;
        }
    }
}
