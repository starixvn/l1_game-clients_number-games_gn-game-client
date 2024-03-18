import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";

export const BetPercentage: React.FC<BaseProps> = ({ gameName, choice, className, percentageColor }) => {
    const { betPercentage } = useGameBettingZoneContext();

    return (
        <div id={`${gameName}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage[choice]} color={percentageColor} />
        </div>
    );
};
