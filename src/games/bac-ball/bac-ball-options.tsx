import { useCallback, useEffect, useRef, useState } from "react";

import { useGameActionContext, useGameContext, useSystemContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { BetChoice, BetPercentage, Odds, OwnBet, PlayerBetCount, TotalBet } from "../../components/game-components/bet-option";
import { setRipplePosition } from "../../components/game-components/bet-option/ripple-effect";
import { BacBallWinningAnimation } from "./bac-ball-winning-animation";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions, BacBallBetOptionsPercentageColor } from "./constants";

const BacBallBetOptionsComponent = () => {
    const rippleButtons = useRef([]);
    const [ripplePosX, setRipplePosX] = useState(0);
    const [ripplePosY, setRipplePosY] = useState(0);

    const gameActionContext = useGameActionContext();
    const systemContext = useSystemContext();

    const onClickBet = useCallback(
        (choice: string) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );

    const { roundState, settlementResult, showResultInfo, roundHistory, turnCounter } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();

    const isShowDisabledLayer = roundState === RoundState.LockingBet;

    const renderTotalBet = (choice: string) => {
        const tieClassName = `justify-center mt-1`;
        return (
            <TotalBet
                choice={choice}
                className={`${choice === BacBallBetOptions.TIE ? tieClassName : ""}`}
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
                percentageColor={BacBallBetOptionsPercentageColor[choice]}
            />
        );
    };
    const renderPlayerBetCount = (choice: string) => {
        const tieClassName = "justify-center";
        return (
            <PlayerBetCount
                choice={choice}
                className={`flex items-center players gap-1 ${choice === BacBallBetOptions.TIE ? tieClassName : ""}`}
                tolgeeNamespace={tolgeeNamespace}
            />
        );
    };
    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={`${Style[`bet-name-${choice}`]}`} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds turnCounter={turnCounter} choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />;
    };

    useEffect(() => {
        return setRipplePosition(setRipplePosX, setRipplePosY, rippleButtons);
    }, [rippleButtons]);

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case BacBallBetOptions.PLAYER:
                className = `${Style["highlight-prev-result-player"]} fade-in`;
                break;
            case BacBallBetOptions.BANKER:
                className = `${Style["highlight-prev-result-player"]} ${Style["reverse"]} fade-in`;
                break;
            case BacBallBetOptions.TIE:
                className = `${Style["highlight-prev-result-tie"]} fade-in`;
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderMainOption = (choice: string) => {
        const winningResult = (
            <BacBallWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={BacBallBetOptions.PLAYER}
            />
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

                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && winningPrev}
            </div>
        );
    };

    const renderBetOptionTie = () => {
        const winningResult = (
            <BacBallWinningAnimation
                roundState={roundState}
                settlementResult={settlementResult}
                showResultInfo={showResultInfo}
                choice={BacBallBetOptions.TIE}
                resourceName={BacBallBetOptions.TIE}
                className="absolute"
            />
        );

        const winningPrev = renderHighlightWinningPrevResult(BacBallBetOptions.TIE);
        const totalBetComponent = renderTotalBet(BacBallBetOptions.TIE);
        const betPercentage = renderBetPercentage(BacBallBetOptions.TIE);
        const playerBetCount = renderPlayerBetCount(BacBallBetOptions.TIE);
        const betChoice = renderBetChoice(BacBallBetOptions.TIE);
        const odds = renderOdds(BacBallBetOptions.TIE);
        const ownBet = renderOwnBet(BacBallBetOptions.TIE);
        return (
            <div className={`${Style[BacBallBetOptions.TIE]} text-white flex flex-col items-center pt-2`}>
                {betPercentage}
                <div className={Style.stake}>
                    {totalBetComponent}
                    {playerBetCount}
                </div>
                <div className={`${Style["choice-odds-area"]} ${Style[`${BacBallBetOptions.TIE}-choice`]}`}>
                    {betChoice}
                    {odds}
                </div>
                {ownBet}
                {<div className={Style["winning-effect"]}>{winningResult}</div>}
                <button
                    ref={(el) => (rippleButtons.current[2] = el)}
                    className={`btn-ripple ${Style["btn-ripple"]} ${isShowDisabledLayer}`}
                    id={`${tolgeeNamespace}-choice-tie`}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.TIE);
                    }}
                >
                    <span className="ripple-effect"></span>
                </button>
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}

                {isShowHighlightPrevResult({ betChoice: BacBallBetOptions.TIE, roundHistory, roundState }) && winningPrev}
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
                 .ripple-effect {
                    top: calc(1 / var(--zoom-game) * ${ripplePosY}px);
                    left: calc(1 / var(--zoom-game) * ${ripplePosX}px);
                   }
                 `}
            </style>
        </>
    );
};

export default BacBallBetOptionsComponent;
