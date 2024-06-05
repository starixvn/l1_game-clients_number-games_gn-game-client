import dynamic from "next/dynamic";

import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { DotColorMapper, LuckyThreeBetOptions, LuckyThreeBetOptionsPercentageColor } from "./lucky-three-constants";
import Style from "./lucky-three.module.scss";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const LuckyThreeWinningAnimation = dynamic(() => import("./lucky-three-winning-animation"));

const LuckyThreeBetOptionsComponent = () => {
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
                percentageColor={LuckyThreeBetOptionsPercentageColor[choice]}
            />
        );
    };

    const renderPlayerBetCount = (choice: string, className?: string) => {
        return (
            <PlayerBetCount choice={choice} className={`flex items-center players gap-1 ${className}`} tolgeeNamespace={tolgeeNamespace} />
        );
    };

    const renderBetChoice = (choice: string) => {
        return <BetChoice choice={choice} className={Style[`bet-name-${choice}`]} tolgeeNamespace={tolgeeNamespace} />;
    };

    const renderOdds = (choice: string) => {
        return <Odds turnCounter={turnCounter} choice={choice} tolgeeNamespace={tolgeeNamespace} animationDuration={6} />;
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    const renderBetInfo = (choice) => {
        const betInfoText = {
            [LuckyThreeBetOptions.OVER]: "[92 - 177]",
            [LuckyThreeBetOptions.UNDER]: "[6 - 91]",
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
            case LuckyThreeBetOptions.OVER:
                className = `${Style["highlight-prev-result-over"]} fade-in`;
                break;
            case LuckyThreeBetOptions.UNDER:
                className = `${Style["highlight-prev-result-under"]} fade-in`;
                break;
            case LuckyThreeBetOptions.RED2:
                className = `${Style["highlight-prev-result-red2"]} fade-in`;
                break;
            case LuckyThreeBetOptions.RED3:
                className = `${Style["highlight-prev-result-red3"]} fade-in`;
                break;
            case LuckyThreeBetOptions.BLUE3:
                className = `${Style["highlight-prev-result-blue3"]} fade-in`;
                break;
            case LuckyThreeBetOptions.BLUE2:
                className = `${Style["highlight-prev-result-blue2"]} fade-in`;
                break;
            default:
        }

        return <div className={className}></div>;
    };

    const renderHighlightWinningResult = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case LuckyThreeBetOptions.OVER:
            case LuckyThreeBetOptions.UNDER:
                resourceName = LuckyThreeBetOptions.OVER;
                break;

            case LuckyThreeBetOptions.BLUE3:
            case LuckyThreeBetOptions.RED3:
                resourceName = LuckyThreeBetOptions.BLUE3;
                break;

            case LuckyThreeBetOptions.BLUE2:
            case LuckyThreeBetOptions.RED2:
                resourceName = LuckyThreeBetOptions.BLUE2;
                break;
        }

        return (
            <LuckyThreeWinningAnimation
                showResultInfo={showResultInfo}
                roundState={roundState}
                settlementResult={settlementResult}
                choice={choice}
                resourceName={resourceName}
            />
        );
    };

    const renderMainOption = (choice: string) => {
        const className = Style[`choice-${choice}`];

        return (
            <div className={`${Style[choice]} text-white relative`}>
                <div className={`${Style["choice-info"]} ${className}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice, choice === LuckyThreeBetOptions.OVER ? "justify-end" : "")}
                        {renderPlayerBetCount(choice, choice === LuckyThreeBetOptions.OVER ? "justify-end" : "")}
                    </div>
                    {renderBetPercentage(choice)}
                </div>
                <div className={`${Style["choice-odds-area"]}`}>
                    {renderBetChoice(choice)}
                    {renderBetInfo(choice)}
                    {renderOdds(choice)}
                </div>

                {renderOwnBet(choice)}
                <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

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
                <div className={`${Style["dot-wrapper"]}`}>{renderDot(choice)}</div>
                {renderOdds(choice)}
                <div className={Style["own-bet-container"]}>{renderOwnBet(choice)}</div>
                <div className={Style["winning-effect"]}>{renderHighlightWinningResult(choice)}</div>

                <RippleButton className={`${Style["btn-ripple"]}`} id={`${tolgeeNamespace}-choice-${choice}`} choice={choice} />
                {isShowDisabledLayer && <div className={Style["disable-layer"]}></div>}
                {isShowHighlightPrevResult({ betChoice: choice, roundState, roundHistory }) && renderHighlightWinningPrevResult(choice)}
            </div>
        );
    };

    return (
        <>
            <div className="flex justify-between">
                <div className={Style["bet-option-row"]}>{renderMainOption(LuckyThreeBetOptions.OVER)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(LuckyThreeBetOptions.UNDER)}</div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {renderSubOptions(LuckyThreeBetOptions.BLUE3)}
                {renderSubOptions(LuckyThreeBetOptions.BLUE2)}
                {renderSubOptions(LuckyThreeBetOptions.RED2)}
                {renderSubOptions(LuckyThreeBetOptions.RED3)}
            </div>
        </>
    );
};

export default LuckyThreeBetOptionsComponent;
