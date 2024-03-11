import { useCallback, useEffect, useRef, useState } from "react";

import { useGameActionContext, useSystemContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { BetChoice, BetPercentage, Odds, OwnBet, TotalBet } from "../../components/game-components/bet-option";
import { setRipplePosition } from "../../components/game-components/bet-option/ripple-effect";
import { BacBallWinningAnimation } from "./bac-ball-winning-animation";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions, BacBallBetOptionsPercentageColor } from "./constants";

export const BacBallBetOptionsComponent = () => {
    const rippleButtons = useRef([]);
    const [ripplePosX, setRipplePosX] = useState(0);
    const [ripplePosY, setRipplePosY] = useState(0);

    const gameActionContext = useGameActionContext();
    const systemContext = useSystemContext();

    const onClickBet = useCallback(
        (choice: string) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );
    const gameName = "BacBall";
    const showHighlightPrevResult = useShowHighlightPrevResult;
    const { roundState } = useGameStateContext();
    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const renderTotalBet = (choice: string) => {
        const tieClassName = `justify-center mt-1`;
        return <TotalBet choice={choice} className={`${choice === BacBallBetOptions.TIE ? tieClassName : ""}`} gameName={gameName} />;
    };

    const renderBetPercentage = (choice: string) => {
        return (
            <BetPercentage
                choice={choice}
                className={Style.percent}
                gameName={gameName}
                percentageColor={BacBallBetOptionsPercentageColor[choice]}
            />
        );
    };

    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={`${Style[`bet-name-${choice}`]}`} gameName={gameName} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds choice={choice} gameName={gameName} animationDuration={5} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} gameName={gameName} />;
    };

    useEffect(() => {
        return setRipplePosition(setRipplePosX, setRipplePosY, rippleButtons);
    }, [rippleButtons]);

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case BacBallBetOptions.PLAYER:
                className = Style["highlight-prev-result-player"];
                break;
            case BacBallBetOptions.BANKER:
                className = `${Style["highlight-prev-result-player"]} ${Style["reverse"]}`;
                break;
            case BacBallBetOptions.TIE:
                className = Style["highlight-prev-result-tie"];
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderMainOption = (choice: string) => {
        const winningResult = (
            <BacBallWinningAnimation choice={choice} resourceName={BacBallBetOptions.PLAYER} width={210} height={210} position={[90, 95]} />
        );
        const winningPrev = renderHighlightWinningPrevResult(choice);
        const totalBetComponent = renderTotalBet(choice);
        const betPercentage = renderBetPercentage(choice);
        const betChoice = renderBetChoice(choice);
        const odds = renderOdds(choice);
        const ownBet = renderOwnBet(choice);
        return (
            <div className={`${Style[choice]} text-white relative`}>
                <div className={`${Style["choice-info"]} ${Style[`choice-${choice}`]}`}>
                    <div className={Style.stake}>{totalBetComponent}</div>
                    {betPercentage}
                </div>
                <div className={`${Style["choice-odds-area"]} ${Style[`${choice}-choice`]}`}>
                    {betChoice}
                    {odds}
                </div>

                {ownBet}
                <button
                    ref={(el) => (rippleButtons.current[choice === "player" ? 0 : 1] = el)}
                    className={`btn-ripple ${Style["btn-ripple"]} ${isShowDisabledLayer}`}
                    onClick={() => {
                        onClickBet(choice);
                    }}
                ></button>
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {<div className={Style["winning-effect"]}>{winningResult}</div>}
                {showHighlightPrevResult({ betChoice: choice }) && winningPrev}
            </div>
        );
    };

    const renderBetOptionTie = () => {
        const winningResult = (
            <BacBallWinningAnimation
                choice={BacBallBetOptions.TIE}
                resourceName={BacBallBetOptions.TIE}
                width={210}
                height={210}
                position={[105, 90]}
                className="absolute"
            />
        );

        const winningPrev = renderHighlightWinningPrevResult(BacBallBetOptions.TIE);
        const totalBetComponent = renderTotalBet(BacBallBetOptions.TIE);
        const betPercentage = renderBetPercentage(BacBallBetOptions.TIE);
        const betChoice = renderBetChoice(BacBallBetOptions.TIE);
        const odds = renderOdds(BacBallBetOptions.TIE);
        const ownBet = renderOwnBet(BacBallBetOptions.TIE);
        return (
            <div className={`${Style[BacBallBetOptions.TIE]} text-white flex flex-col items-center pt-2`}>
                {betPercentage}
                <div className={Style.stake}>{totalBetComponent}</div>
                <div className={`${Style["choice-odds-area"]} ${Style[`${BacBallBetOptions.TIE}-choice`]}`}>
                    {betChoice}
                    {odds}
                </div>
                {ownBet}
                <button
                    ref={(el) => (rippleButtons.current[2] = el)}
                    className={`btn-ripple ${Style["btn-ripple"]} ${isShowDisabledLayer}`}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.TIE);
                    }}
                ></button>
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {<div className={Style["winning-effect"]}>{winningResult}</div>}
                {showHighlightPrevResult({ betChoice: BacBallBetOptions.TIE }) && winningPrev}
            </div>
        );
    };
    return (
        <>
            {renderMainOption(BacBallBetOptions.PLAYER)}
            {renderMainOption(BacBallBetOptions.BANKER)}
            {renderBetOptionTie()}
            <style>
                {`
                 .${Style["btn-ripple"]}:after {
                    top: calc(1 / var(--zoom-game) * ${ripplePosY}px);
                    left: calc(1 / var(--zoom-game) * ${ripplePosX}px);
                   }
                 `}
            </style>
        </>
    );
};
