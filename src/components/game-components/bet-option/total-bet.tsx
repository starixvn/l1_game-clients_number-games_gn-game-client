import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { BaseProps } from "./types";

const convertStakeToString = (amount: number, rate: number) => (amount ? numberWithCommas(amount / rate, 1) : "");

export const TotalBet: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { totalBets, rate } = useGameStateContext();
    const totalBet = totalBets?.[choice] ?? 0;

    if (totalBet <= 0) {
        return <div className={className}></div>;
    }

    return (
        <div className={className}>
            <span className="icon-coin"></span>
            <span id={`${gameName}-${choice}-total-stakes`} className="stakes-value">
                {convertStakeToString(totalBet, rate)}
            </span>
        </div>
    );
};
