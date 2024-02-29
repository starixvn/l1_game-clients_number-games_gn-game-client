import { useCallback } from "react";

import { useGameActionContext, useSystemContext } from "../../_shared/react-contexts";
import { useShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { BetChoice, BetPercentage, Odds, OwnBet, PlayerBetCount, TotalBet } from "../../components/game-components/bet-option";
import { BacBallWinningAnimation } from "./bac-ball-winning-animation";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions, BacBallBetOptionsPercentageColor } from "./constants";

export const BacBallBetOptionsComponent = () => {
    const gameActionContext = useGameActionContext();
    const systemContext = useSystemContext();
    const onClickBet = useCallback(
        (choice) => gameActionContext.placeBet(choice, systemContext.selectedChip),
        [gameActionContext, systemContext.selectedChip]
    );
    const gameName = "BacBall";
    const showHighlightPrevResult = useShowHighlightPrevResult;

    const renderTotalBet = (choice: string) => {
        const tieClassName = "justify-center mt-1";
        return (
            <TotalBet
                choice={choice}
                className={`flex items-center ${Style["total-stakes"]} gap-1 ${choice === BacBallBetOptions.TIE ? tieClassName : ""}`}
                gameName={gameName}
            />
        );
    };

    const renderPlayerBetCount = (choice: string) => {
        const tieClassName = "justify-center";
        return (
            <PlayerBetCount
                choice={choice}
                className={`flex items-center players gap-1 ${choice === BacBallBetOptions.TIE ? tieClassName : ""}`}
                gameName={gameName}
            />
        );
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
        return (
            <BetChoice
                choice={choice}
                className={`bet-name text-center ${choice === BacBallBetOptions.TIE ? "mt-3" : Style["bet-name"]}`}
                gameName={gameName}
            />
        );
    };

    const renderOdds = (choice: string) => {
        return <Odds choice={choice} className="bet-odds text-center" gameName={gameName} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} className={`own-bet ${Style["own-bet"]}`} gameName={gameName} />;
    };

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
        const playerBetCount = renderPlayerBetCount(choice);
        const betPercentage = renderBetPercentage(choice);
        const betChoice = renderBetChoice(choice);
        const odds = renderOdds(choice);
        const ownBet = renderOwnBet(choice);
        return (
            <div className={`${Style[choice]} text-white relative`}>
                {<div className={Style["winning-effect"]}>{winningResult}</div>}
                {showHighlightPrevResult({ betChoice: choice }) && winningPrev}
                <div className={`flex justify-between pt-5`}>
                    <div className={Style.stake}>
                        {totalBetComponent}
                        {playerBetCount}
                    </div>
                    {betPercentage}
                </div>
                {betChoice}
                {odds}
                {ownBet}
                <button
                    className={Style["btn-ripple"]}
                    onClick={() => {
                        onClickBet(choice);
                    }}
                ></button>
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
                position={[105, 77]}
                className="absolute"
            />
        );

        const winningPrev = renderHighlightWinningPrevResult(BacBallBetOptions.TIE);
        const totalBetComponent = renderTotalBet(BacBallBetOptions.TIE);
        const playerBetCount = renderPlayerBetCount(BacBallBetOptions.TIE);
        const betPercentage = renderBetPercentage(BacBallBetOptions.TIE);
        const betChoice = renderBetChoice(BacBallBetOptions.TIE);
        const odds = renderOdds(BacBallBetOptions.TIE);
        const ownBet = renderOwnBet(BacBallBetOptions.TIE);
        return (
            <div
                className={`${Style[BacBallBetOptions.TIE]} text-white flex flex-col items-center pt-2 relative`}
                onClick={() => {
                    onClickBet(BacBallBetOptions.TIE);
                }}
            >
                {winningResult}
                {showHighlightPrevResult({ betChoice: BacBallBetOptions.TIE }) && winningPrev}
                {betPercentage}
                <div className={Style.stake}>
                    {totalBetComponent}
                    {playerBetCount}
                </div>
                {betChoice}
                {odds}
                {ownBet}
                <button
                    className={Style["btn-ripple"]}
                    onClick={() => {
                        onClickBet(BacBallBetOptions.TIE);
                    }}
                ></button>
            </div>
        );
    };
    return (
        <>
            {renderMainOption(BacBallBetOptions.PLAYER)}
            {renderMainOption(BacBallBetOptions.BANKER)}
            {renderBetOptionTie()}
        </>
    );
};
