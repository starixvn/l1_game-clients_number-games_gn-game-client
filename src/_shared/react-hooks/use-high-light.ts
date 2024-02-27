import { useGameStateContext } from "../react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../components/game-base/type";

export function useWinningHighLightResult({ betChoice }) {
    const gameStateContext = useGameStateContext();
    const { roundState, settlementResult, showResultInfo } = gameStateContext;

    return roundState === RoundState.DisplayResult && showResultInfo && settlementResult && settlementResult[betChoice];
}

export function useShowHighlightPrevResult({ betChoice }) {
    const gameStateContext = useGameStateContext();
    const { roundState, roundHistory } = gameStateContext;

    if (roundHistory[0]) {
        return [RoundState.BeforeStartRound, RoundState.InRound].includes(roundState) && roundHistory[0].settlementResult[betChoice];
    }

    return false;
}
