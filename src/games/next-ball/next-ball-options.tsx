import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameActionContext, useGameContext, useSystemContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { setRipplePosition } from "../../components/game-components/bet-option/ripple-effect";
import { NextBallBetOptions, NextBallBetOptionsPercentageColor } from "./next-ball-constants";
import Style from "./next-ball.module.scss";

const NextBallWinningAnimation = dynamic(() => import("./next-ball-winning-animation"));
const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));

const NextBallBetOptionsComponent = () => {
    const rippleButtons = useRef([]);
    const [ripplePosX, setRipplePosX] = useState(0);
    const [ripplePosY, setRipplePosY] = useState(0);

    const gameActionContext = useGameActionContext();
    const systemContext = useSystemContext();

    const onClickBet = useCallback(
        (choice: string) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );

    const { roundState, settlementResult, showResultInfo, roundHistory } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const renderTotalBet = (choice: string) => {
        return <TotalBet choice={choice} className="relative" tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderBetPercentage = (choice: string) => {
        return (
            <BetPercentage
                choice={choice}
                className={Style.percent}
                tolgeeNamespace={tolgeeNamespace}
                percentageColor={NextBallBetOptionsPercentageColor[choice]}
            />
        );
    };

    const renderPlayerBetCount = (choice: string) => {
        return <PlayerBetCount choice={choice} className={`flex items-center players gap-1 relative`} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={`${Style[`bet-name-${choice}`]}`} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    useEffect(() => {
        return setRipplePosition(setRipplePosX, setRipplePosY, rippleButtons);
    }, [rippleButtons]);

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case NextBallBetOptions.OVER:
                className = `${Style["highlight-prev-result-over"]} fade-in`;
                break;
            case NextBallBetOptions.UNDER:
                className = `${Style["highlight-prev-result-over"]} ${Style["reverse"]} fade-in`;
                break;

            case NextBallBetOptions.ODD:
                className = `${Style["highlight-prev-result-odd"]} fade-in`;
                break;
            case NextBallBetOptions.EVEN:
                className = `${Style["highlight-prev-result-odd"]} ${Style["reverse"]} fade-in`;
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderMainOption = (choice: string) => {
        const winningResult = (
            <NextBallWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={NextBallBetOptions.OVER}
                width={210}
                height={210}
                position={[90, 95]}
            />
        );

        return (
            <div className={`${Style[choice]} text-white relative`}>
                <div className={`${Style["choice-info"]} ${Style[`choice-${choice}`]}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice)}
                        {renderPlayerBetCount(choice)}
                    </div>
                    {renderBetPercentage(choice)}
                </div>
                <div className={`${Style["choice-odds-area"]} ${Style[`${choice}-choice`]}`}>
                    {renderBetChoice(choice)}
                    {renderOdds(choice)}
                </div>

                {renderOwnBet(choice)}
                {<div className={Style["winning-effect"]}>{winningResult}</div>}
                <button
                    ref={(el) => (rippleButtons.current[choice === "player" ? 0 : 1] = el)}
                    className={`btn-ripple ${Style["btn-ripple"]} ${isShowDisabledLayer}`}
                    id={`${tolgeeNamespace}-choice-${choice}`}
                    onClick={() => {
                        onClickBet(choice);
                    }}
                >
                    <span className="ripple-effect"></span>
                </button>
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
            </div>
        );
    };

    return (
        <>
            <div className={Style["bet-option-row"]}>
                {renderMainOption(NextBallBetOptions.OVER)}
                {renderMainOption(NextBallBetOptions.ODD)}
            </div>
            <div className={Style["bet-option-row"]}>
                {renderMainOption(NextBallBetOptions.UNDER)}
                {renderMainOption(NextBallBetOptions.EVEN)}
            </div>

            <style>
                {`
                 .ripple-effect {
                    top: calc(1 / var(--zoom-game) * ${ripplePosY}px);
                    left: calc(1 / var(--zoom-game) * ${ripplePosX}px);
                   }
                 `}
            </style>
        </>
    );
};

export default NextBallBetOptionsComponent;
