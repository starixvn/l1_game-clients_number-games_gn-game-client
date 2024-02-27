import { formatOdds } from "../../../_shared/helpers";
import { useAuthContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { BaseProps } from "./types";

export const Odds: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { gameConfigs } = useGameStateContext();
    const { fractionalOddsFormat } = useAuthContext();
    const oddsValue = formatOdds(gameConfigs?.odds?.[choice] ?? 0, fractionalOddsFormat);

    return (
        <div id={`${gameName}-${choice}-odds`} className={className}>
            {oddsValue}
        </div>
    );
};
