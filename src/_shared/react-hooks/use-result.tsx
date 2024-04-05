import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { messageEventType } from "../../components/game-base/handlers";
import { Round, RoundState } from "../../components/game-base/type";
import { useGameContext } from "../react-contexts";

interface UseResultProps<R> {
    result: R;
    roundState: RoundState;
    roundHistory: Round<R | object, object>[];
}

const useResult = <R,>(props: UseResultProps<R>) => {
    const { result, roundState, roundHistory } = props;
    const { durations } = useGameContext();
    const { gameMessageHandler } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);
    const [currentResult, setCurrentResult] = useState<R | object>(null);
    const [isFirstJoinGame, setIsFirstJoinGame] = useState<boolean>(true);

    useEffect(() => {
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(clientRemainingTime);
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, []);

    useEffect(() => {
        if (isEmpty(result) && roundState === RoundState.DisplayResult && isFirstJoinGame && clientRemainingTime !== durations.wholeTurn) {
            setIsFirstJoinGame(false);
            setCurrentResult(roundHistory[0]?.result);
        }

        if (!isEmpty(result)) {
            setIsFirstJoinGame(false);
            setCurrentResult(result);
        }
    }, [roundState, roundHistory, result, clientRemainingTime]);

    return currentResult as R;
};

export default useResult;
