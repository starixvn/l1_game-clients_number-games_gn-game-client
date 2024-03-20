import { useEffect, useMemo, useState } from "react";

import { formatOdds } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

type Props = {
    animationClass?: string;
    animationDuration?: number;
} & BaseProps;

export const Odds: React.FC<Props> = ({ tolgeeNamespace, choice, className, animationDuration }) => {
    const [showOddsIcon, setShowOddsIcon] = useState(false);
    const [isOddUp, setIsOddUp] = useState(false);
    const [oddsValue, setOddsValue] = useState(0);
    const { gameConfigs } = useGameStateContext();
    const { fractionalOddsFormat } = usePlayerContext();

    useEffect(() => {
        const odds = gameConfigs?.odds?.[choice] ?? 0;

        oddsValue > 0 && oddsValue !== +odds && setShowOddsIcon(true);

        setIsOddUp(odds > oddsValue);
        setOddsValue(odds);
    }, [gameConfigs?.odds?.[choice] ?? 0]);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (showOddsIcon) {
            timeOut = setTimeout(() => {
                setShowOddsIcon(false);
            }, animationDuration * 1000);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [showOddsIcon, animationDuration]);
    const odds = formatOdds(oddsValue, fractionalOddsFormat);
    return useMemo(() => {
        return oddsValue != 0 ? (
            <div
                id={`${tolgeeNamespace}-${choice}-odds`}
                className={`text-center ${Styles["bet-odds"]} ${className} ${isOddUp ? Styles["up"] : Styles["down"]} ${
                    showOddsIcon ? Styles["show-odds-icon"] : ""
                }`}
            >
                {odds}
            </div>
        ) : (
            <></>
        );
    }, [odds, showOddsIcon]);
};
