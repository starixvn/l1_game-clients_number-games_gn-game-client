import { useEffect, useMemo, useState } from "react";

import { formatOdds } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

type Props = {
    animationClass?: string;
    animationDuration?: number;
    turnCounter: number;
    isFormatOddsAuto?: boolean;
} & BaseProps;

export const Odds: React.FC<Props> = ({ tolgeeNamespace, choice, className, animationDuration, turnCounter, isFormatOddsAuto }) => {
    const [showOddsIcon, setShowOddsIcon] = useState(false);
    const [isOddUp, setIsOddUp] = useState(false);
    const [oddsValue, setOddsValue] = useState(0);
    const { gameConfigs, roundState } = useGameStateContext();
    const { fractionalOddsFormat } = usePlayerContext();
    const odds = isFormatOddsAuto ? formatOdds(oddsValue, fractionalOddsFormat, 1) : formatOdds(oddsValue, fractionalOddsFormat);

    useEffect(() => {
        const odds = gameConfigs?.odds?.[choice] ?? 0;
        oddsValue === 0 && setOddsValue(odds);
        if (roundState === RoundState.InRound) {
            if (turnCounter !== 1) {
                oddsValue > 0 && oddsValue !== +odds && setShowOddsIcon(true);
                setIsOddUp(odds > oddsValue);
            }

            setOddsValue(odds);
        }
    }, [gameConfigs?.odds?.[choice] ?? 0, roundState]);

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

    return useMemo(() => {
        return oddsValue > 0 ? (
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

export default Odds;
