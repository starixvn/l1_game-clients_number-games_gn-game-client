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
            setCurrentResult(roundHistory[0]?.result);
            setIsJoinGame(false);
        }

        if (!isEmpty(result)) {
            setCurrentResult(result);
            setIsJoinGame(false);
        }
    }, [roundState, roundHistory, result]);

    return currentResult;
};

export default useResult;
