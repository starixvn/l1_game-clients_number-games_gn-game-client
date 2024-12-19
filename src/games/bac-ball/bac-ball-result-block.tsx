import { FC, useEffect, useRef, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { BacBallResultSlotContainer } from "./bac-ball-result-slot-container";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./constants";
import { BacBallResult } from "./types";

export type BacBallResultBlockProps = Partial<GameStateContextModel>;
const minHeightGameArea = 722;
const minWidthGameArea = 430;

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
    const [scale, setScale] = useState(0.5);
    const [distance, setDistance] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            // if (window.visualViewport) {
            //     setViewportHeight((prev) => {
            //         const ratio = window.visualViewport.height / prev;
            //         setScale(ratio);
            //         resultRef?.current && (resultRef.current.style.transform = `scale(${ratio})`);
            //         return window.visualViewport.height;
            //     });
            // } else {
            //     // Fallback for older browsers
            //     setViewportHeight((prev) => {
            //         const ratio = window.innerHeight / prev;
            //         setScale(ratio);
            //         resultRef?.current && (resultRef.current.style.transform = `scale(${ratio})`);
            //         return window.innerHeight;
            //     });
            // }

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
                <p className={`${Style["viewport"]}`}>scale: {scale}</p>
                <p className={`${Style["viewport"]}`}>Height: {viewportHeight}px</p>
                <p className={`${Style["viewport"]}`}>Distance: {distance}</p>
            </div>
            <div className={Style["result"]}>
                <Cage
                    scale={scale}
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
                    scale={scale}
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
