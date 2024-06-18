import dynamic from "next/dynamic";
import Image from "next/image";

import { buildVersion } from "../../_shared/constants";
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

    const renderTotalBet = (choice: string, className?: string) => {
        return <TotalBet choice={choice} className={className} tolgeeNamespace={tolgeeNamespace} />;
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

    const renderPlayerBetCount = (choice: string, className?: string) => {
        return (
            <PlayerBetCount
                choice={choice}
                className={`flex items-center players gap-1 relative ${className}`}
                tolgeeNamespace={tolgeeNamespace}
            />
        );
    };

    const renderBetChoice = (choice: string) => {
        const className = Style[`bet-name-${choice}`];
        return <BetChoice choice={choice} className={className} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds turnCounter={turnCounter} choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    const renderBetInfo = (choice) => {
        const betInfoText = {
            [NextBallBetOptions.OVER]: "[38 - 75]",
            [NextBallBetOptions.UNDER]: "[1 - 37]",
        };

        const betInfoClassName = Style["bet-info"];

        if (betInfoText.hasOwnProperty(choice)) {
            return <div className={betInfoClassName}>{betInfoText[choice]}</div>;
        }

        return null;
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

    const getBackgroundName = (choice) => {
        let backgroundName = "";

        switch (choice) {
            case NextBallBetOptions.OVER:
            case NextBallBetOptions.ODD:
                backgroundName = NextBallBetOptions.OVER;
                break;

            case NextBallBetOptions.UNDER:
            case NextBallBetOptions.EVEN:
                backgroundName = NextBallBetOptions.ODD;
                break;
        }

        return backgroundName;
    };

    const renderMainOption = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case NextBallBetOptions.OVER:
            case NextBallBetOptions.UNDER:
                resourceName = NextBallBetOptions.OVER;
                break;

            case NextBallBetOptions.ODD:
            case NextBallBetOptions.EVEN:
                resourceName = NextBallBetOptions.ODD;
                break;
        }

        const backgroundName = getBackgroundName(choice);

        const winningResult = (
            <NextBallWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={resourceName}
            />
        );
        const choiceClassName = Style[`choice-${choice}`];
        const oddsClassName = Style[`choice-${choice}`];
        return (
            <div className={`${Style[choice]} text-white relative`}>
                <Image
                    className={Style["bg-bet-option"]}
                    width={176}
                    height={94}
                    blurDataURL={`/static/images/next-ball/divide-4x/bg-${backgroundName}.png?v=${buildVersion}`}
                    src={`/static/images/next-ball/2x/bg-${backgroundName}.webp?v=${buildVersion}`}
                    alt={choice}
                    priority={true}
                />

                <div className={`${Style["choice-info"]} ${choiceClassName}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice, Style["stake-style"])}
                        {renderPlayerBetCount(choice, Style["stake-style"])}
                    </div>
                    {renderBetPercentage(choice)}
                </div>
                <div className={`${Style["choice-odds-area"]} ${oddsClassName}`}>
                    {renderBetChoice(choice)}
                    {renderBetInfo(choice)}
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
