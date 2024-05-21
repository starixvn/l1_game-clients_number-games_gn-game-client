import { memo, useEffect, useState } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";
import { usePlaceBetContext } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";

export const OwnBet: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { notConfirmOwnBets, ownBets } = usePlaceBetContext();
    const [isShowBetAnim, setIsShowBetAnim] = useState(false);
    const [latestNotConfirmBet, setLatestNotConfirmBet] = useState(-1);
    const [ownBet, setOwnBet] = useState(0);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (ownBets?.[choice] > 0) {
            if (!isShowBetAnim) {
                setIsShowBetAnim(true);
                const acceptedBet = ownBets[choice] - ownBet;
                acceptedBet > 0 && setLatestNotConfirmBet(acceptedBet);
                timeOut = setTimeout(() => {
                    setIsShowBetAnim(false);
                    setLatestNotConfirmBet(0);
                }, 500);
            } else {
                setIsShowBetAnim(false);
            }
        }
        setOwnBet(ownBets[choice] ?? 0);

        return () => {
            clearTimeout(timeOut);
        };
    }, [ownBets?.[choice]]);

    const ownBetUI = (value: string, animClass = "") => {
        return (
            <div className={`${Styles["own-bet"]} ${className} ${animClass}`}>
                <span id={`${tolgeeNamespace}-${choice}-own-bet`} className={Styles["bet-value"]}>
                    {value}
                </span>
            </div>
        );
    };

    const ownBetValue = ownBet + (notConfirmOwnBets?.[choice] ?? 0);
    return (
        <>
            {ownBetValue > 0 && ownBetUI(numberWithCommas(ownBetValue, 1))}
            {isShowBetAnim && latestNotConfirmBet > 0 && ownBetUI(numberWithCommas(latestNotConfirmBet, 1), Styles["own-bet-anim"])}
        </>
    );
};

export default memo(OwnBet);
