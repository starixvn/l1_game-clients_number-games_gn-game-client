import dynamic from "next/dynamic";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { DotColorMapper, SeBallBetOptions, SeBallBetOptionsPercentageColor } from "./se-ball-constants";
import Style from "./se-ball.module.scss";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const SeBallWinningAnimation = dynamic(() => import("./se-ball-winning-animation"));

const SeBallBetOptionsComponent = () => {
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
                percentageColor={SeBallBetOptionsPercentageColor[choice]}
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
            case SeBallBetOptions.ODD:
                className = `${Style["highlight-prev-result-odd"]} fade-in`;
                break;
            case SeBallBetOptions.EVEN:
                className = `${Style["highlight-prev-result-even"]} fade-in`;
                break;
            case SeBallBetOptions.BLUE3:
                className = `${Style["highlight-prev-result-blue3"]} fade-in`;
                break;
            case SeBallBetOptions.BLUE4:
                className = `${Style["highlight-prev-result-blue4"]} fade-in`;
                break;
            case SeBallBetOptions.RED3:
                className = `${Style["highlight-prev-result-red3"]} fade-in`;
                break;
            case SeBallBetOptions.RED4:
                className = `${Style["highlight-prev-result-red4"]} fade-in`;
                break;
            case SeBallBetOptions.RED2:
                className = `${Style["highlight-prev-result-red2"]} fade-in`;
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderMainOption = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case SeBallBetOptions.ODD:
            case SeBallBetOptions.EVEN:
                resourceName = SeBallBetOptions.ODD;
                break;
        }

        const winningResult = (
            <SeBallWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={resourceName}
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

    const renderDot = (choice: string) => {
        const dots = DotColorMapper[choice];

        if (dots) {
            return dots.map((dot, index) => <div key={index} className={`${dot ? Style["dot-red"] : Style["dot-blue"]}`}></div>);
        }

        return null;
    };

    const renderSubOptions = (choice: string) => {
        return (
            <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
                <div className={`${Style["dot-wrapper"]} ${choice === "red2" ? Style["two-lines"] : ""}`}>{renderDot(choice)}</div>
                {renderOdds(choice)}
                <div className={Style["own-bet-container"]}>{renderOwnBet(choice)}</div>

                <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
            </div>
        );
    };

    return (
        <>
            <div className="flex justify-between">
                <div className={Style["bet-option-row"]}>{renderMainOption(SeBallBetOptions.ODD)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(SeBallBetOptions.EVEN)}</div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {renderSubOptions(SeBallBetOptions.BLUE3)}
                {renderSubOptions(SeBallBetOptions.BLUE4)}
                {renderSubOptions(SeBallBetOptions.RED2)}
                {renderSubOptions(SeBallBetOptions.RED3)}
                {renderSubOptions(SeBallBetOptions.RED4)}
            </div>
        </>
    );
};

export default SeBallBetOptionsComponent;
