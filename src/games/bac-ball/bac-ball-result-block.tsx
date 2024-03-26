import { Resource, Texture } from "pixi.js";
import { FC, memo, useEffect, useState } from "react";

import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { IBallColor, RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { BacBallResultSlotContainer } from "./bac-ball-result-slot-container";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./constants";

export type BacBallResultBlockProps = Partial<GameStateContextModel>;

export const BacBallResultBlock: FC<BacBallResultBlockProps> = (props: BacBallResultBlockProps) => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [], blue2: [], red2: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);
    const { result, roundState, roundHistory, playResultAnimation, settlementResult, showResultInfo } = props;

    let currentResult = null;
    if (!result && roundState === RoundState.DisplayResult) {
        currentResult = roundHistory[0].result;
    } else if (result) {
        currentResult = result;
    }

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

    useEffect(() => {
        const handleLoadResource = async () => {
            if (
                cageBallFrames.blue.length === 0 &&
                cageBallFrames.red.length === 0 &&
                cageBallFrames.blue2.length === 0 &&
                cageBallFrames.red2.length === 0
            ) {
                await loadPixiAnimations("/static/images/cage/ball.json", (sprite) => {
                    const blueFrames = sprite.animations["blue"];
                    const redFrames = sprite.animations["red"];
                    const blue2Frames = sprite.animations["blue2"];
                    const red2Frames = sprite.animations["red2"];
                    setCageBallFrames({ blue: blueFrames, red: redFrames, blue2: blue2Frames, red2: red2Frames });
                });
            }

            if (cageBallsLoopFrames.length === 0) {
                await loadPixiAnimations("/static/images/cage/cage-balls.json", (sprite) => {
                    setCageBallsLoopFrames(sprite.animations["loop"]);
                });
            }
        };

        handleLoadResource();
    }, [
        cageBallFrames.blue.length,
        cageBallFrames.red.length,
        cageBallFrames.blue2.length,
        cageBallFrames.red2.length,
        cageBallsLoopFrames.length,
    ]);

    if (
        cageBallsLoopFrames?.length === 0 ||
        cageBallFrames?.blue?.length === 0 ||
        cageBallFrames?.red?.length === 0 ||
        cageBallFrames?.blue2?.length === 0 ||
        cageBallFrames?.red2?.length === 0
    ) {
        return (
            <div className={Style["result-container"]}>
                <div className={Style["result"]}>
                    <div className="cage-blur blue"></div>
                    <BacBallResultSlotContainer delayTime={0} betChoice={null} className="player-balls" />
                </div>
                <div className={Style["result"]}>
                    <div className="cage-blur red"></div>
                    <BacBallResultSlotContainer delayTime={0} betChoice={null} className="banker-balls" />
                </div>
            </div>
        );
    }

    return (
        <div className={Style["result-container"]}>
            <div className={Style["result"]}>
                <Cage
                    cageBallsLoopFrames={cageBallsLoopFrames}
                    cageBallFrames={cageBallFrames}
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
                    cageBallsLoopFrames={cageBallsLoopFrames}
                    cageBallFrames={cageBallFrames}
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

export default memo(BacBallResultBlock);
