import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

const convertStakeToString = (amount: number, rate: number) => (amount ? numberWithCommas(amount / rate, 1) : "");

export const TotalBet: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const { totalBets, rate } = useGameStateContext();
    const totalBet = totalBets?.[choice] ?? 0;

    if (totalBet <= 0) {
        return <div className={className}></div>;
    }

    return (
        <div className={`flex items-center gap-1 ${Styles["total-stakes"]} ${className}`}>
            <span className={`icon-coin ${Styles["icon-coin"]}`}></span>
            <span id={`${gameName}-${choice}-total-stakes`} className={Styles["stakes-value"]}>
                {convertStakeToString(totalBet, rate)}
            </span>
        </div>
    );
};
