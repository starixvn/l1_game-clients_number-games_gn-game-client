import React, { useEffect, useState } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import CountdownTimer from "../countdown-timer/countdown-timer";
import { RoundState } from "../../game-base/type";

export const GameHeader = () => {
    const { roundId, roundState } = useGameStateContext();
    const [displayedRoundId, setDisplayedRoundId] = useState(roundId);

    useEffect(() => {
        console.log(`\x1B[31m roundId: ${roundId}`);
        if (roundState === RoundState.InRound) {
            setDisplayedRoundId(roundId);
        }
    }, [roundState, roundId]);

    return (
        <div className="game-header">
            {displayedRoundId > 0 && (
                <div id="round-id" className="round-id">
                    #{displayedRoundId}
                </div>
            )}

            <div id="countdown-timer" className="countdown-timer">
                <CountdownTimer />
            </div>
        </div>
    );
};
