import { useEffect, useState } from "react";
import { formatOdds } from "../../../_shared/helpers";
import { useAuthContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { BaseProps } from "./types";

type Props = {
    animationClass?: string;
    animationDuration?: number;
} & BaseProps;

export const Odds: React.FC<Props> = ({ gameName, choice, className, animationClass, animationDuration }) => {
    const [hasAnim, setHasAnim] = useState(false);
    const [oddsValue, setOddsValue] = useState(0);
    const { gameConfigs } = useGameStateContext();
    const { fractionalOddsFormat } = useAuthContext();
    useEffect(() => {
        oddsValue > 0 && oddsValue !== +gameConfigs?.odds?.[choice] && setHasAnim(true);
        setOddsValue(gameConfigs?.odds?.[choice] ?? 0);
    }, [gameConfigs?.odds?.[choice] ?? 0]);

    useEffect(() => {
        hasAnim &&
            setTimeout(() => {
                setHasAnim(false);
            }, animationDuration * 1000);
    }, [hasAnim, animationDuration]);

    return (
        <div id={`${gameName}-${choice}-odds`} className={`${className} ${hasAnim ? animationClass : ""}`}>
            {formatOdds(oddsValue, fractionalOddsFormat)}
        </div>
    );
};
