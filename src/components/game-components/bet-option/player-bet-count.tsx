import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { BaseProps } from "./types";

export const PlayerBetCount: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { playerBetCount } = useGameStateContext();

    return (
        <div className={className}>
            <span className="icon-user"></span>
            <span id={`${gameName}-${choice}-no`} className="player-value">
                {playerBetCount[choice]}
            </span>
        </div>
    );
};
