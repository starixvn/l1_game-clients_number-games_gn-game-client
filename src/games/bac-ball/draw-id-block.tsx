import React, { useEffect, useState } from "react";

import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../components/game-base/type";

export const DrawIdBlock = () => {
    const { drawId, roundState } = useGameStateContext();
    const [displayedRawId, setDdisplayedRawId] = useState(drawId);

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setDdisplayedRawId(drawId);
        }
    }, [roundState, drawId]);

    return (
        <div>
            {displayedRawId > 0 && (
                <div key={displayedRawId} id="round-id" className="round-id">
                    #{displayedRawId}
                </div>
            )}
        </div>
    );
};
