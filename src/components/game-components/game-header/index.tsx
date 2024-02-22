import React from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import CountdownTimer from "../countdown-timer/countdown-timer";

export const GameHeader = () => {
    const gameStateContext = useGameStateContext();
    const { roundId } = gameStateContext;

    return (
        <>
            <div id="round-id" className="round-id">
                #{roundId}
            </div>
            <div id="countdown-timer" className="countdown-timer">
                <CountdownTimer />
            </div>
        </>
    );
};