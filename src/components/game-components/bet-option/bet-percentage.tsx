import { isEmpty } from "lodash";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className, percentageColor }) => {
    const { betPercentage } = useGameBettingZoneContext();
    const { roundState } = useGameStateContext();

    if (isEmpty(betPercentage) || roundState === RoundState.SwitchRound) {
        return <></>;
    }

    return (
        <div id={`${tolgeeNamespace}-${choice}-percent`} className={className}>
            <PercentageCircle percentage={betPercentage?.[choice]} color={percentageColor} />
        </div>
    );
};

export default BetPercentage;
