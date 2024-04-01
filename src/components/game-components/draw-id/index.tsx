import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export const DrawIdBlock = () => {
    const { drawId } = useGameStateContext();

    return (
        <div>
            {drawId > 0 && (
                <div key={drawId} id="round-id" className="round-id">
                    #{drawId}
                </div>
            )}
        </div>
    );
};

export default DrawIdBlock;
