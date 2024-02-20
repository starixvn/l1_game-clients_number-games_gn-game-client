import React, { useEffect, useRef, useState } from "react";
import { useCountUp } from "react-countup";
import { useGameActionContext, useGameContext, useSystemContext } from "../../../_shared/react-contexts";
import { formatOdds, numberWithCommas } from "../../../_shared/helpers/number-helper";
import { RoundState } from "../../game-base/type";
import { Tooltip } from "../tooltip";
import Styles from "./bet-option.module.scss";
import { HighlightType, Props } from "./types";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

const HighlightClassNameMapper = {
    [HighlightType.Background]: "highlight-winning",
    [HighlightType.None]: "",
};

const convertStakeToString = (amount: number, rate: number) => (amount ? numberWithCommas(amount / rate, 1) : "");

const BetOption: React.FunctionComponent<Props> = ({
    roundState,
    choice,
    odd,
    children,
    tooltipMessage,
    isHighlight = false,
    isDisplayOdd = true,
    isShowWinningEffect = false,
    isShowPoolStake = true,
    isShowTooltip = false,
}) => {
    const { gameName } = useGameContext();
    const { ownBets, rate } = useGameStateContext();
    const { openPlaceBetModal, placeBet } = useGameActionContext();
    const { enabledQuickBet, betValue, fractionalOddsFormat } = useSystemContext();
    const [highlightType, updateHighlightType] = useState<HighlightType>(HighlightType.None);
    //const [totalBet, setTotalBet] = useState<number>(totalBets?.[choice] ?? 0);
    const totalBetRef = useRef<HTMLDivElement>(null);
    const { start, update } = useCountUp({ ref: totalBetRef, start: 0, end: 0 });
    const betChoiceRef = useRef<HTMLDivElement>(null);

    const [isFocusChoice, setIsFocusChoice] = useState<boolean>(false);

    useEffect(() => {
        const actionByGameState = {
            [RoundState.LockingBet]: () => {
                updateHighlightType(HighlightType.None);
            },
            [RoundState.InRound]: () => {
                updateHighlightType(HighlightType.Background);
            },
            [RoundState.BeforeStartRound]: () => {
                updateHighlightType(HighlightType.Background);
            },
        };

        actionByGameState[roundState] && actionByGameState[roundState]();

        // setTotalBet(totalBets?.[choice] ?? 0);
        //update(totalBet);

        // console.log(`totalBets : ${JSON.stringify(totalBets)}-- choice : ${totalBets?.[choice] ?? 0}`);
        // console.log(`choice : ${choice}`);

        //console.log(`totalBet : ${totalBet}`);
    }, [roundState]);

    const onClickBet = (event: any) => {
        event.preventDefault();
        const betChoiceRect = betChoiceRef.current.getBoundingClientRect();

        if (enabledQuickBet) {
            placeBet(choice, betValue, { x: event.clientX, y: event.clientY }, { left: betChoiceRect.left, right: betChoiceRect.right });
        } else {
            setIsFocusChoice(true);
            const betOptionElement = totalBetRef.current.nextElementSibling;
            openPlaceBetModal(choice, removeBetChoiceFocus, betOptionElement, betChoiceRef.current);
        }
    };

    const removeBetChoiceFocus = () => {
        setIsFocusChoice(false);
    };

    const betOptionClasses = `${Styles["bet-option"]} ${isFocusChoice ? Styles["focus"] : ""} 
        ${isHighlight && Styles[HighlightClassNameMapper[highlightType]]} 
        ${isHighlight && isShowWinningEffect && Styles["winning-effect"]} 
        ${roundState !== RoundState.InRound && Styles["disallowed"]}
        ${Styles[gameName.toLocaleLowerCase()]}`;

    const oddsClass = `${Styles["odd"]}`;
    const oddsValue = formatOdds(odd, fractionalOddsFormat);
    return (
        <>
            <div className={Styles.container} ref={betChoiceRef}>
                <div className={betOptionClasses} onClick={onClickBet}>
                    {isDisplayOdd && <div className={oddsClass}>{odd ? oddsValue : ""}</div>}
                    <div className={Styles["total-bet"]} ref={totalBetRef}>
                        {isShowPoolStake && convertStakeToString(+start, rate)}
                    </div>

                    {children}
                    <div className={Styles["own-bet"]}>
                        {ownBets?.[choice] ? (
                            <span key={ownBets[choice]} className={`d-inline-block ${ownBets[choice]}`}>
                                {numberWithCommas(ownBets[choice])}
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>
            {isShowTooltip && <Tooltip message={tooltipMessage} hoverWrapper={betChoiceRef} isShowAtHoverPosition={true} />}
        </>
    );
};

export default BetOption;
