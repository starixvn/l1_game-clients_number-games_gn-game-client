import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export const DrawIdBlock = ({ showRoundId = false }) => {
    const { drawId, roundId, availableInGameData } = useGameStateContext();
    const id = showRoundId ? roundId : drawId;

    return (
        <div>
            {id > 0 && availableInGameData && (
                <div key={id} id="round-id" className="round-id text-animation">
                    #{id}
                </div>
            )}
        </div>
    );
};

export default DrawIdBlock;
