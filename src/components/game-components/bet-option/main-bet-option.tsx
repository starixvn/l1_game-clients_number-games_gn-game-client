import { useCallback, useEffect, useRef, useState } from "react";
import { TotalBet } from "./total-bet";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useGameActionContext, useGameContext, useSystemContext } from "../../../_shared/react-contexts";
import { useShowHighlightPrevResult } from "../../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../game-base/type";
import { BetPercentage } from "./bet-percentage";
import { PlayerBetCount } from "./player-bet-count";
import { BetChoice } from "./bet-choice";
import { Odds } from "./odds";
import { OwnBet } from "./own-bet";
import { setRipplePosition } from "./ripple-effect";
import Style from "./main-bet-option.module.scss";
import { WinningAnimation } from "./winning-animation";

export type MainBetOptionsComponentProps = {
    betOptionsPercentageColor: { [key: string]: string };
    renderHighlightWinningPrevResult: Function;
    defaultWinningAnimationResourceName: string;
}

export const MainBetOptionsComponent: React.FC<MainBetOptionsComponentProps> = ({
    betOptionsPercentageColor,
    renderHighlightWinningPrevResult,
    defaultWinningAnimationResourceName
}) => {
    // const rippleButtons = useRef([]);
    // const [ripplePosX, setRipplePosX] = useState(0);
    // const [ripplePosY, setRipplePosY] = useState(0);

    const gameActionContext = useGameActionContext();
    const systemContext = useSystemContext();

    const onClickBet = useCallback(
        (choice: string) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );

    const showHighlightPrevResult = useShowHighlightPrevResult;
    const { roundState } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const renderTotalBet = (choice: string) => {
        return (
            <TotalBet
                choice={choice}
                className={""}
                tolgeeNamespace={tolgeeNamespace}
            />
        );
    };

    const renderBetPercentage = (choice: string) => {
        return (
            <BetPercentage
                choice={choice}
                className={Style.percent}
                tolgeeNamespace={tolgeeNamespace}
                percentageColor={betOptionsPercentageColor[choice]}
            />
        );
    };
    const renderPlayerBetCount = (choice: string) => {
        return (
            <PlayerBetCount
                choice={choice}
                className={`flex items-center players gap-1 `}
                tolgeeNamespace={tolgeeNamespace}
            />
        );
    };
    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={`${Style[`bet-name-${choice}`]}`} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />;
    };

    // useEffect(() => {
    //     return setRipplePosition(setRipplePosX, setRipplePosY, rippleButtons);
    // }, [rippleButtons]);

    const renderMainOption = (choice: string) => {
        const winningResult = (
            <WinningAnimation choice={choice} resourceName={defaultWinningAnimationResourceName} width={210} height={210} position={[90, 95]} />
        );
        const winningPrev = renderHighlightWinningPrevResult(choice);
        const totalBetComponent = renderTotalBet(choice);
        const playerBetCount = renderPlayerBetCount(choice);
        const betPercentage = renderBetPercentage(choice);
        const betChoice = renderBetChoice(choice);
        const odds = renderOdds(choice);
        const ownBet = renderOwnBet(choice);

        return (
            <div className={`${Style[choice]} text-white relative`}>
                <div className={`${Style["choice-info"]} ${Style[`choice-${choice}`]}`}>
                    <div className={Style.stake}>
                        {totalBetComponent}
                        {playerBetCount}
                    </div>
                    {betPercentage}
                </div>
                <div className={`${Style["choice-odds-area"]} ${Style[`${choice}-choice`]}`}>
                    {betChoice}
                    {odds}
                </div>

                {ownBet}

                {<div className={Style["winning-effect"]}>{winningResult}</div>}

                {/* <button
                    ref={(el) => (rippleButtons.current[choice === "player" ? 0 : 1] = el)} //  review choice dependencies
                    className={`btn-ripple ${Style["btn-ripple"]} ${isShowDisabledLayer}`}
                    id={`${tolgeeNamespace}-choice-${choice}`}
                    onClick={() => {
                        onClickBet(choice);
                    }}
                >
                    <span className="ripple-effect"></span>
                </button> */}

                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}

                {showHighlightPrevResult({ betChoice: choice }) && winningPrev}
            </div>
        );
    };

    return (
        <>
            {/* <div className={Style["bet-option-row"]}>
                {renderMainOption(NextBallBetOptions.OVER)}
                {renderMainOption(NextBallBetOptions.UNDER)}
            </div>
            <div className={Style["bet-option-row"]}>
                {renderMainOption(NextBallBetOptions.ODD)}
                {renderMainOption(NextBallBetOptions.EVEN)}
            </div>

            <style>
                {`
                 .ripple-effect {
                    top: calc(1 / var(--zoom-game) * ${ripplePosY}px);
                    left: calc(1 / var(--zoom-game) * ${ripplePosX}px);
                   }
                 `}
            </style> */}
        </>
    );
};
