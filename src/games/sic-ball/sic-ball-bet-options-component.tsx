import dynamic from "next/dynamic";
import Image from "next/image";
import { useGameContext } from "../../_shared/react-contexts";
import { useGameStateContext } from "../../_shared/react-contexts/game-state-context/game-state-context";
import { isShowHighlightPrevResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { SicBallBetOptions, SicBallBetOptionsPercentageColor } from "./sic-ball-constants";
import Style from "./sic-ball.module.scss";
import { buildVersion } from "../../_shared/constants";

const BetChoice = dynamic(() => import("../../components/game-components/bet-option/bet-choice"));
const RippleButton = dynamic(() => import("../../components/game-components/bet-option/ripple-button"));
const BetPercentage = dynamic(() => import("../../components/game-components/bet-option/bet-percentage"));
const Odds = dynamic(() => import("../../components/game-components/bet-option/odds"));
const OwnBet = dynamic(() => import("../../components/game-components/bet-option/own-bet"));
const PlayerBetCount = dynamic(() => import("../../components/game-components/bet-option/player-bet-count"));
const TotalBet = dynamic(() => import("../../components/game-components/bet-option/total-bet"));
const SicBallWinningAnimation = dynamic(() => import("./sic-ball-winning-animation"));

const SicBallBetOptionsComponent = () => {
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
                percentageColor={SicBallBetOptionsPercentageColor[choice]}
            />
        );
    };

    const renderBetInfo = (choice) => {
        const betInfoText = {
            [SicBallBetOptions.BIG]: "[11 - 18]",
            [SicBallBetOptions.SMALL]: "[3 - 10]",
        };

        const betInfoClassName = Style["bet-info"];

        if (betInfoText.hasOwnProperty(choice)) {
            return <div className={betInfoClassName}>{betInfoText[choice]}</div>;
        }

        return null;
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
        return (
            <Odds
                turnCounter={turnCounter}
                choice={choice}
                tolgeeNamespace={tolgeeNamespace}
                animationDuration={6}
                isFormatOddsAuto={true}
            />
        );
    };

    const renderOwnBet = (choice: string) => {
        return <OwnBet choice={choice} tolgeeNamespace={tolgeeNamespace} className={Style["own-bet"]} />;
    };

    const renderHighlightWinningPrevResult = (choice: string) => {
        let className = "";
        switch (choice) {
            case SicBallBetOptions.BIG:
                className = `${Style["highlight-prev-result-big"]} fade-in`;
                break;
            case SicBallBetOptions.SMALL:
                className = `${Style["highlight-prev-result-small"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC1:
                className = `${Style["highlight-prev-result-specific1"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC2:
                className = `${Style["highlight-prev-result-specific2"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC3:
                className = `${Style["highlight-prev-result-specific3"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC4:
                className = `${Style["highlight-prev-result-specific4"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC5:
                className = `${Style["highlight-prev-result-specific5"]} fade-in`;
                break;
            case SicBallBetOptions.SPECIFIC6:
                className = `${Style["highlight-prev-result-specific6"]} fade-in`;
                break;
            default:
        }
        return <div className={className}></div>;
    };

    const renderHighlightWinningResult = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case SicBallBetOptions.BIG:
            case SicBallBetOptions.SMALL:
                resourceName = SicBallBetOptions.SMALL;
                break;

            case SicBallBetOptions.SPECIFIC1:
            case SicBallBetOptions.SPECIFIC2:
            case SicBallBetOptions.SPECIFIC3:
            case SicBallBetOptions.SPECIFIC4:
            case SicBallBetOptions.SPECIFIC5:
            case SicBallBetOptions.SPECIFIC6:
                resourceName = SicBallBetOptions.SPECIFIC1;
                break;
        }

        return (
            <SicBallWinningAnimation
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
                        {renderTotalBet(choice, choice === SicBallBetOptions.BIG ? "justify-end" : "")}
                        {renderPlayerBetCount(choice, choice === SicBallBetOptions.BIG ? "justify-end" : "")}
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

    const renderSubOptions = (choice: string) => {
        return (
            <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
                {renderTotalBet(choice, Style["side-bet-total-bet"])}
                <Image
                    src={`/static/images/sic-ball/${choice.toLowerCase()}.png?v=${buildVersion}`}
                    width={32}
                    height={32}
                    alt={`icon-${choice.toLowerCase()}`}
                    className={Style["specific-icon-number"]}
                />
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
                <div className={Style["bet-option-row"]}>{renderMainOption(SicBallBetOptions.BIG)}</div>
                <div className={Style["bet-option-row"]}>{renderMainOption(SicBallBetOptions.SMALL)}</div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {renderSubOptions(SicBallBetOptions.SPECIFIC1)}
                {renderSubOptions(SicBallBetOptions.SPECIFIC2)}
                {renderSubOptions(SicBallBetOptions.SPECIFIC3)}
                {renderSubOptions(SicBallBetOptions.SPECIFIC4)}
                {renderSubOptions(SicBallBetOptions.SPECIFIC5)}
                {renderSubOptions(SicBallBetOptions.SPECIFIC6)}
            </div>
        </>
    );
};

export default SicBallBetOptionsComponent;
