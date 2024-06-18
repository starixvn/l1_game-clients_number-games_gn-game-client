import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { buildVersion } from "../../_shared/constants";
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
    const rgbDataURL = () =>
        `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAABeCAYAAACHDE6RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVSSURBVHgB7dzNThtXGMbx95z5NJ+GQJSgSpmuuvUd1CzaWt2UXgEQqZGyansFJFeQZFUpaWt6BU03KVUXmCuocwOVkSra8hEbbDwztmdOzhlCQggQDBg8J89vg2c8iVj8OXp9ZoDRJSn84HvM4jnB4qw89AjgBIJEjcWsvPRNpnSa6xn1QL4osm4nyAnT+IoLkZffVK7d6VAQdiiKY1KvAU5icE6ObdFgxpGVskXqxL+cFPWFhlx44ufJ5LNCiJmmH2YbzUDG26ag1aZYBgzQLcs0aMB1aHJ8hCzLXKQgvr90N1M5fN2FhFz4yZ+TPzWzu36YV/HW6k2ECxduYmyEJseGK1Gn8/Wfd4bKB987V8hqBWYGf9Dwg9xmtU7NICSAXhoeyNDN69maXCmnD8Z8ppDVDJyJw2IrimbW1qsIGC6VivmjG+MVCsX0/pjBqUtqFXZF+NfWTmPm73/WETFcunrTpxfbux45rLh/rquQvygG37ZFvLy6tun9v7WNORiuzGZ1R+5+Rflkg4G6CLlQDBfCoP1wdW0DqzBcObWN+2K7Iffp2II6PtWMLCMuBkFrbvXfTazC0DfUXvMn3lTNZ/bH5vsuVisxIoZ+pFZluWOWHbTj3ImjhYq43e7cQ8TQr+ScrAZk79iQ1RCdRCxnYkQM/erV4w5Hh1wo+p4cootqjzgpHqDPHbMi8wV5p87D7gSkxTshf/7j7owcKeY25D4dQFq8EzLnxgNEDGnzVsjqKbamH3rb9SYBpMnbKzJjCxvVOgGkzeuQk+22ToQPeJBKb1Zkk89iNoa0eh3yq19PIoA0SkJWW26+H2Zx8wPSKgnZ4CyvHlYGSKsk5Jj4p+pX9QHSKgmZEeWwWwFpxj973MqFYZsA0owbLMpGeEwTUo6rh5Jb2K2AlFMzsoe/xQZp1/XftQDoRwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkEELCBm0gJBBCwgZtICQQQsIGbSAkCHVXNumWMRlhAyp5joWCUNUTAJIKUeuxpZpVJbmXazIkF7XRgeJCXqkXiNkSCXLNGl0eKAiWuKpOkbIkEq3piaS1XjpbqaijtWMXFF1A6TF1GSWLMtc/H3eebh/zqSYKrZpEEC/45zTjWsjcqQYLAVkf3/wPTMwg3LGyNTkRdk4jgmgHw24Nk1dHyfTNB4t3Xa/O/w+L82P1RhROTucIYB+4tgmjY8O0a2bE3ImnixZjE//cUTEyt5wHIn746PD+VrdJ6zKcBXU2ODKcAczjlx9HXmjw5bnWEUQ/cYi8VSuwqWT/j3bf1H4OViubjfy/21tE0CvyRsZybigglXhOo6VTAYy3OcijkotY6BUmme10/5/b7YrmJgfGx1abvih12gGBHBR9lfbvWhtueq6yWpLjJVktM+NKC49u+2W6RzYwYMvHzdybc6X19arWcQMZ6XC3QtWjgi2lQTMOFOhrjAhytSi0v7+70Vhh0+omGPT/HWzuuNtVOsE8D5OMtu68qslv9pyZ8GscUGlmOIVFrNyYLrlbsaEs2BHnSwUfY8E3Wt34tmN6g41/Ra1Ox0COO5DmRoT5E7BSi9W29NgJ71ZeOLnyaA5edls0w8paLUpwq7GB0nd/VVjwnk/lPUKO+2FKmrBRY4RyxJ8iCo8isrP7gyd60NZr7wEkYoPp81n8RkAAAAASUVORK5CYII=`;

    const [src, setSRC] = useState(rgbDataURL());

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
                percentageColor={SeBallBetOptionsPercentageColor[choice]}
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

    const renderHighlightWinningResult = (choice: string) => {
        let resourceName = "";

        switch (choice) {
            case SeBallBetOptions.ODD:
            case SeBallBetOptions.EVEN:
                resourceName = SeBallBetOptions.EVEN;
                break;

            case SeBallBetOptions.BLUE3:
            case SeBallBetOptions.RED3:
                resourceName = SeBallBetOptions.BLUE3;
                break;

            case SeBallBetOptions.BLUE4:
            case SeBallBetOptions.RED4:
                resourceName = SeBallBetOptions.BLUE4;
                break;

            case SeBallBetOptions.RED2:
                resourceName = SeBallBetOptions.RED2;
                break;
        }

        return (
            <SeBallWinningAnimation
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
                <Image
                    className={Style["bg-bet-option"]}
                    width={178}
                    height={94}
                    src={src}
                    onLoadingComplete={() => {
                        setSRC(`/static/images/se-ball/2x/bg-${choice}.webp?v=${buildVersion}`);
                    }}
                    alt={choice}
                    priority={true}
                />

                <div className={`${Style["choice-info"]} ${className}`}>
                    <div className={Style.stake}>
                        {renderTotalBet(choice, choice === SeBallBetOptions.ODD ? "justify-end" : "")}
                        {renderPlayerBetCount(choice, choice === SeBallBetOptions.ODD ? "justify-end" : "")}
                    </div>
                    {renderBetPercentage(choice)}
                </div>
                <div className={`${Style["choice-odds-area"]}`}>
                    {renderBetChoice(choice)}
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

    const getSubOptionsBackgroundName = (choice) => {
        let backgroundName = "";

        switch (choice) {
            case SeBallBetOptions.BLUE3:
            case SeBallBetOptions.RED3:
                backgroundName = SeBallBetOptions.BLUE3;
                break;

            case SeBallBetOptions.BLUE4:
            case SeBallBetOptions.RED4:
                backgroundName = SeBallBetOptions.RED4;
                break;

            case SeBallBetOptions.RED2:
                backgroundName = SeBallBetOptions.RED2;
                break;
        }

        return backgroundName;
    };

    const renderSubOptions = (choice: string) => {
        const backgroundName = getSubOptionsBackgroundName(choice);

        return (
            <div className={`${Style[choice]} ${Style["bet-choice"]}`}>
                <Image
                    className={Style["bg-bet-option"]}
                    width={choice === SeBallBetOptions.RED2 ? 77 : 136}
                    height={choice === SeBallBetOptions.RED2 ? 149 : 66}
                    blurDataURL={`/static/images/se-ball/divide-4x/bg-${backgroundName}.png?v=${buildVersion}`}
                    src={`/static/images/se-ball/2x/bg-${backgroundName}.webp?v=${buildVersion}`}
                    alt={choice}
                    priority={true}
                />

                <div className={`${Style["dot-wrapper"]} ${choice === "red2" ? Style["two-lines"] : ""}`}>{renderDot(choice)}</div>
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
