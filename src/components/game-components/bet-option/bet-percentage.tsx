import PercentageCircle from "../percentage-circle";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ gameName, choice, className, percentageColor }) => {
    const { betPercentage } = useGameStateContext();

    return (
        <div id={`${gameName}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage[choice]} color={percentageColor} />
        </div>
    );
};
