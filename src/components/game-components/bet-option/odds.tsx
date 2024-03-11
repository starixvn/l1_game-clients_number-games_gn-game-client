import { useEffect, useState } from "react";

import { formatOdds } from "../../../_shared/helpers";
import { useAuthContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

type Props = {
    animationClass?: string;
    animationDuration?: number;
} & BaseProps;

export const Odds: React.FC<Props> = ({ gameName, choice, className, animationDuration }) => {
    const [showOddsIcon, setShowOddsIcon] = useState(false);
    const [isOddUp, setIsOddUp] = useState(false);
    const [oddsValue, setOddsValue] = useState(0);
    const { gameConfigs } = useGameStateContext();
    const { fractionalOddsFormat } = useAuthContext();

    useEffect(() => {
        const odds = gameConfigs?.odds?.[choice] ?? 0;

        oddsValue > 0 && oddsValue !== +odds && setShowOddsIcon(true);

        setIsOddUp(odds > oddsValue);
        setOddsValue(odds);
    }, [gameConfigs?.odds?.[choice] ?? 0]);

    useEffect(() => {
        showOddsIcon &&
            setTimeout(() => {
                setShowOddsIcon(false);
            }, animationDuration * 1000);
    }, [showOddsIcon, animationDuration]);

    return (
        <div
            id={`${gameName}-${choice}-odds`}
            className={`text-center ${Styles["bet-odds"]} ${className} ${isOddUp ? Styles["up"] : Styles["down"]} ${
                showOddsIcon ? Styles["show-odds-icon"] : ""
            }`}
        >
            {formatOdds(oddsValue, fractionalOddsFormat)}
        </div>
    );
};
