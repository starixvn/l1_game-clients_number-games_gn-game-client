import { Resource, Texture } from "pixi.js";
import { FC, memo, useEffect, useState } from "react";

import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { IBallColor, RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import Style from "./next-ball.module.scss";
import { ResultSlotContainer } from "../../components/game-components/result-container/result-container";
import { defaultRoundData, NextBallBetOptions } from "./next-ball-constants";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";

export type NextBallResultBlockProps = Partial<GameStateContextModel>;

export const NextBallResultBlock: FC<NextBallResultBlockProps> = (props: NextBallResultBlockProps) => {
    const [cageBallFrames, setCageBallFrames] = useState<IBallColor>({ blue: [], red: [], blue2: [], red2: [] });
    const [cageBallsLoopFrames, setCageBallsLoopFrames] = useState<Texture<Resource>[]>([]);
    const { result, roundState, roundHistory, playResultAnimation, settlementResult, showResultInfo, roundData } = props;

    let currentResult = null;
    if (!result && roundState === RoundState.DisplayResult) {
        currentResult = roundHistory[0].result;
    } else if (result) {
        currentResult = result;
    }

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
                    <ResultSlotContainer betChoiceBalls="balls" defaultRoundData={defaultRoundData} delayTime={0} betChoice={null} className="balls" />
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
                    position={CagePosition.CENTER}
                    isSmall={true}
                    result={currentResult?.ball}
                    delayShowResultTime={0}
                    playResultAnimation={playResultAnimation}
                    roundState={roundState}
                    highlight={isHighLightWinningResult({
                        betChoice: NextBallBetOptions.ODD,
                        roundState,
                        settlementResult,
                        showResultInfo,
                    })}
                />
                <ResultSlotContainer
                    defaultRoundData={defaultRoundData}
                    delayTime={0}
                    betChoice={""}
                    className="balls"
                    betChoiceBalls="balls"
                    {...props} />
            </div>

        </div>
    );
};

export default memo(NextBallResultBlock);
