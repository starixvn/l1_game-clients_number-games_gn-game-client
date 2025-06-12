import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

const convertStakeToString = (amount: number, rate: number) => {
    if (amount) {
        const total = amount / rate;
        const options = { maximumFractionDigits: 2 };
        const locale = "en-US";
        if (total >= 10_000_000) {
            return (total / 1_000_000).toLocaleString(locale, options) + "M";
        }
        if (total >= 10_000) {
            return (total / 1_000).toLocaleString(locale, options) + "K";
        }
        if (total < 0.01) {
            return "0";
        }
        return total.toLocaleString(locale, options);
    }
    return "";
};

export const TotalBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { totalBets } = useGameBettingZoneContext();
    const { rate, roundState } = useGameStateContext();
    const totalBet = totalBets?.[choice] ?? 0;

    if (totalBet <= 0 || rate === 0 || [RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <></>;
    }

    return (
        <div className={`flex items-center gap-1 ${Styles["total-stakes"]} ${className}`}>
            <span className={`icon-coin ${Styles["icon-coin"]}`}></span>
            <span id={`${tolgeeNamespace}-${choice}-total-stakes`} className={Styles["stakes-value"]}>
                {convertStakeToString(totalBet, rate)}
            </span>
        </div>
    );
};
export default TotalBet;
