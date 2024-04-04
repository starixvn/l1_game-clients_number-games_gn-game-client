import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { Round, RoundState } from "../../components/game-base/type";

interface UseResultProps<R> {
    result: R;
    roundState: RoundState;
    roundHistory: Round<R, object>[];
}

const useResult = <R,>(props: UseResultProps<R>) => {
    const { result, roundState, roundHistory } = props;
    const [currentResult, setCurrentResult] = useState<any>({});
    const [isJoinGame, setIsJoinGame] = useState<boolean>(true);

    useEffect(() => {
        if (isEmpty(result) && roundState === RoundState.DisplayResult && isJoinGame) {
            setIsJoinGame(false);
            setCurrentResult(roundHistory[0]?.result);
        }

        if (!isEmpty(result)) {
            setIsJoinGame(false);
            setCurrentResult(result);
        }
    }, [roundState, roundHistory, result]);

    return currentResult;
};

export default useResult;
