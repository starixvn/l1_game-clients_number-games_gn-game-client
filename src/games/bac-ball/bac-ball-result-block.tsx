import { FC, useEffect, useRef, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useDetectDevice from "../../_shared/react-hooks/use-detect-device";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { BacBallResultSlotContainer } from "./bac-ball-result-slot-container";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./constants";
import { BacBallResult } from "./types";

export type BacBallResultBlockProps = Partial<GameStateContextModel>;

export const BacBallResultBlock: FC<BacBallResultBlockProps> = (props: BacBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, settlementResult, showResultInfo, isPlayStartRoundAnimation } = props;
    const bankerDelayTime = 1000;
    const isPlayerBallHighlight = isHighLightWinningResult({
        betChoice: BacBallBetOptions.PLAYER,
        roundState,
        settlementResult,
        showResultInfo,
    });

    const isBankerBallHighlight = isHighLightWinningResult({
        betChoice: BacBallBetOptions.BANKER,
        roundState,
        settlementResult,
        showResultInfo,
    });

    const currentResult = useResult<BacBallResult>({ result, roundState, roundHistory });

    const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height);
    // const [scale, setScale] = useState(0.84);
    const [distance, setDistance] = useState(0);
    const { cageScale, offsetHeight, width, height, prevHeight, resultAreaHeight, resultHeight } = useDetectDevice();

    useEffect(() => {
        const handleResize = () => {
            setViewportHeight((prev) => {
                // const ratio = window.visualViewport.height / prev;
                // setScale(ratio);
                setDistance(window.visualViewport.height - prev);
                return window.visualViewport.height;
            });
        };

        // Attach the resize event listener to visualViewport
        window.visualViewport?.addEventListener("resize", handleResize);

        // Cleanup listener on component unmount
        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
        };
    }, []);

    if (roundState === RoundState.SwitchRound && !isPlayStartRoundAnimation) {
        return <></>;
    }

    return (
        <div
            className={`${Style["result-container"]} ${
                roundState === RoundState.SwitchRound && isPlayStartRoundAnimation ? "showResultContainer" : ""
            }`}
        >
            <div className={`${Style["viewport-container"]}`}>
                <p className={`${Style["viewport"]}`}>viewport prev height: {prevHeight}</p>
                <p className={`${Style["viewport"]}`}>viewport height: {height}</p>
                <p className={`${Style["viewport"]}`}>viewport width: {width}</p>
                <p className={`${Style["viewport"]}`}>Height: {viewportHeight}px</p>
                <p className={`${Style["viewport"]}`}>offsetHeight: {offsetHeight}</p>
                <p className={`${Style["viewport"]}`}>resultAreaHeight: {resultAreaHeight}</p>
                <p className={`${Style["viewport"]}`}>resultHeight: {resultHeight}</p>
            </div>
            <div className={Style["result"]}>
                <Cage
                    scale={cageScale}
                    color={CageColor.BLUE}
                    position={CagePosition.LEFT}
                    isSmall={true}
                    result={currentResult?.player}
                    delayShowResultTime={0}
                    playResultAnimation={playResultAnimation}
                    roundState={roundState}
                    highlight={isPlayerBallHighlight}
                />
                <BacBallResultSlotContainer delayTime={0} betChoice={BacBallBetOptions.PLAYER} className="player-balls" {...props} />
            </div>
            <div className={Style["result"]}>
                <Cage
                    scale={cageScale}
                    color={CageColor.RED}
                    position={CagePosition.RIGHT}
                    isSmall={true}
                    result={currentResult?.banker}
                    delayShowResultTime={bankerDelayTime}
                    playResultAnimation={playResultAnimation}
                    roundState={roundState}
                    highlight={isBankerBallHighlight}
                />
                <BacBallResultSlotContainer
                    delayTime={bankerDelayTime}
                    betChoice={BacBallBetOptions.BANKER}
                    className="banker-balls"
                    {...props}
                />
            </div>
        </div>
    );
};

export default BacBallResultBlock;
