import dynamic from "next/dynamic";
import { v4 as uuidv4 } from "uuid";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { CachedImage } from "../../components/game-components/cached-image";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions, BacBallBetOptionsPercentageColor, BetChoiceImagesData } from "./constants";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const BacBallWinningAnimation = dynamic(() => import("./bac-ball-winning-animation"));

const BacBallBetOptionsComponent = () => {
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
        return <BetChoice choice={choice} className={Style[`bet-name-${choice}`]} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds turnCounter={turnCounter} choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} />;
    };

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
                <CachedImage
                    key={uuidv4}
                    className={Style["bg-bet-option"]}
                    width={178}
                    height={188}
                    src={BetChoiceImagesData[choice]?.src}
                    blurSrc={BetChoiceImagesData[choice]?.blur}
                    alt={choice}
                    priority={true}
                />
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
                <RippleButton className={Style["btn-ripple"]} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />

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
                <CachedImage
                    className={Style["bg-bet-option"]}
                    width={95}
                    height={172}
                    src={BetChoiceImagesData[BacBallBetOptions.TIE]?.src}
                    blurSrc={BetChoiceImagesData[BacBallBetOptions.TIE]?.blur}
                    alt="tie"
                    priority={true}
                />
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
                <RippleButton className={Style["btn-ripple"]} id={`${tolgeeNamespace}-choice-tie`} choice={BacBallBetOptions.TIE} />

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
        </>
    );
};

export default BacBallBetOptionsComponent;
