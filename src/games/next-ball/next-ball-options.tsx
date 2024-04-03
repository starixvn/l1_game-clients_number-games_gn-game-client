import dynamic from "next/dynamic";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { NextBallBetOptions, NextBallBetOptionsPercentageColor } from "./next-ball-constants";
import Style from "./next-ball.module.scss";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const NextBallWinningAnimation = dynamic(() => import("./next-ball-winning-animation"));

const NextBallBetOptionsComponent = () => {
    const { roundState, settlementResult, showResultInfo, roundHistory, turnCounter } = useGameStateContext();
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
        return <Odds turnCounter={turnCounter} choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case NextBallBetOptions.OVER:
                className = `${Style["highlight-prev-result-over"]} fade-in`;
                break;
            case NextBallBetOptions.UNDER:
                className = `${Style["highlight-prev-result-under"]} fade-in`;
                break;

            case NextBallBetOptions.ODD:
                className = `${Style["highlight-prev-result-odd"]} fade-in`;
                break;
            case NextBallBetOptions.EVEN:
                className = `${Style["highlight-prev-result-even"]} fade-in`;
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

                <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />

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
        </>
    );
};

export default NextBallBetOptionsComponent;
