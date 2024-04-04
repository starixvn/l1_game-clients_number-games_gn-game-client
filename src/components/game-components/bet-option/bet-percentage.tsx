import { isEmpty } from "lodash";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className, percentageColor }) => {
    const { betPercentage } = useGameBettingZoneContext();

    if (isEmpty(betPercentage)) {
        return <div className={className}></div>;
    }

    return (
        <div id={`${tolgeeNamespace}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage?.[choice]} color={percentageColor} />
        </div>
    );
};

export default BetPercentage;
