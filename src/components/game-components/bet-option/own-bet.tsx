import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const OwnBet: React.FC<BaseProps> = ({ gameName, choice, className }) => {
    const gameStateContext = useGameStateContext();
    const ownBet = gameStateContext?.ownBets?.[choice] ?? 0;
    const notConfirmOwnBets = gameStateContext?.notConfirmOwnBets?.[choice] ?? 0;
    const ownBetValue = ownBet + notConfirmOwnBets;

    return (
        ownBetValue > 0 && (
            <div className={`${Styles["own-bet"]} ${className}`}>
                <span id={`${gameName}-${choice}-own-bet`} className={Styles["bet-value"]}>
                    {numberWithCommas(ownBetValue, 1)}
                </span>
            </div>
        )
    );
};
