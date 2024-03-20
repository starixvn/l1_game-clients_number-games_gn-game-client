import { useEffect, useState } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const gameStateContext = useGameStateContext();
    const ownBet = gameStateContext?.ownBets?.[choice] ?? 0;
    const notConfirmOwnBets = gameStateContext?.notConfirmOwnBets?.[choice] ?? 0;
    const ownBetValue = ownBet + notConfirmOwnBets;
    const [isShowBetAnim, setIsShowBetAnim] = useState(false);
    const [latestNotConfirmBet, setLatestNotConfirmBet] = useState(-1);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (gameStateContext?.ownBets?.[choice] > 0) {
            if (!isShowBetAnim) {
                setIsShowBetAnim(true);
                timeOut = setTimeout(() => {
                    setIsShowBetAnim(false);
                }, 500);
            } else {
                setIsShowBetAnim(false);
            }
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [gameStateContext.ownBets[choice]]);

    useEffect(() => {
        const lastedBet = [...Object.values(gameStateContext?.acceptedBetQueue || [])];
        if (lastedBet.length > 0) {
            const amount = lastedBet[lastedBet.length - 1]?.amount || 0;

            if (amount > 0) {
                setLatestNotConfirmBet(amount);
            }
        }
    }, [gameStateContext?.acceptedBetQueue]);

    const ownBetUI = (value: string, animClass = "") => {
        return (
            <div className={`${Styles["own-bet"]} ${className} ${animClass}`}>
                <span id={`${tolgeeNamespace}-${choice}-own-bet`} className={Styles["bet-value"]}>
                    {value}
                </span>
            </div>
        );
    };

    return (
        <>
            {ownBetValue > 0 && ownBetUI(numberWithCommas(ownBetValue, 1))}
            {isShowBetAnim && latestNotConfirmBet > 0 && ownBetUI(numberWithCommas(latestNotConfirmBet, 1), Styles["own-bet-anim"])}
        </>
    );
};
