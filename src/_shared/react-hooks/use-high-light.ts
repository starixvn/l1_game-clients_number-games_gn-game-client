import { RoundState } from "../../components/game-base/type";
import { useGameStateContext } from "../react-contexts/game-state-context/game-state-context";

export function useWinningHighLightResult({ betChoice }) {
    const gameStateContext = useGameStateContext();
    const { roundState, settlementResult, showResultInfo } = gameStateContext;

    return roundState === RoundState.DisplayResult && showResultInfo && settlementResult && settlementResult[betChoice];
}

export function useShowHighlightPrevResult({ betChoice }) {
    const gameStateContext = useGameStateContext();
    const { roundState, roundHistory } = gameStateContext;

    if (roundHistory[0]) {
        return (
            [RoundState.SwitchRound, RoundState.BeforePlaceBet, RoundState.InRound].includes(roundState) &&
            roundHistory[0].settlementResult[betChoice]
        );
    }

    return false;
}
