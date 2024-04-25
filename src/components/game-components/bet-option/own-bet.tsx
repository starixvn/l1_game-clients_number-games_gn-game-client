import { memo, useEffect, useState } from "react";
import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import { usePlaceBetContext } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const placeBetContext = usePlaceBetContext();
    // const ownBet = placeBetContext?.ownBets?.[choice] ?? 0;

    const notConfirmOwnBets = 0; //placeBetContext?.notConfirmOwnBets?.[choice] ?? 0;
    // const ownBetValue = ownBet + notConfirmOwnBets;
    const [isShowBetAnim, setIsShowBetAnim] = useState(false);
    const [latestNotConfirmBet, setLatestNotConfirmBet] = useState(-1);
    const [ownBet, setOwnBet] = useState(placeBetContext?.ownBets?.[choice] ?? 0);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        setOwnBet(placeBetContext?.ownBets?.[choice] ?? 0);
        if (placeBetContext?.ownBets?.[choice] > 0) {
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
    }, [placeBetContext.ownBets[choice]]);

    useEffect(() => {
        const lastedBet = [...Object.values(placeBetContext?.acceptedBetQueue || [])];
        if (lastedBet.length > 0) {
            const amount = lastedBet[lastedBet.length - 1]?.amount || 0;

            if (amount > 0) {
                setLatestNotConfirmBet(amount);
            }
        }
    }, [placeBetContext?.acceptedBetQueue]);

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
            {ownBet > 0 && ownBetUI(numberWithCommas(ownBet, 1))}
            {isShowBetAnim && latestNotConfirmBet > 0 && ownBetUI(numberWithCommas(latestNotConfirmBet, 1), Styles["own-bet-anim"])}
        </>
    );
};

export default OwnBet;
