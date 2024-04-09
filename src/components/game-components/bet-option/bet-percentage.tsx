import { isEmpty } from "lodash";
import { useMemo } from "react";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import PercentageCircle from "../percentage-circle";
import { BaseProps } from "./types";

export const BetPercentage: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className, percentageColor }) => {
    const { betPercentage } = useGameBettingZoneContext();
    const { roundState } = useGameStateContext();

    return useMemo(() => {
        if (isEmpty(betPercentage) || roundState === RoundState.SwitchRound) {
            return <div className={className}></div>;
        }

        return (
            <div id={`${tolgeeNamespace}-${choice}-percent`} className={className}>
                <PercentageCircle percentage={betPercentage?.[choice]} color={percentageColor} />
            </div>
        );
    }, [choice, percentageColor]);
};

export default BetPercentage;
