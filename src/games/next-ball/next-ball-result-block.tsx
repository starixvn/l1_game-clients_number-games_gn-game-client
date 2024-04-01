import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { ResultSlotContainer } from "../../components/game-components/result-container/result-container";
import { NextBallBetOptions, defaultRoundData } from "./next-ball-constants";
import Style from "./next-ball.module.scss";

export type NextBallResultBlockProps = Partial<GameStateContextModel>;

const NextBallResultBlock: FC<NextBallResultBlockProps> = (props: NextBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, settlementResult, showResultInfo, roundData } = props;

    let currentResult = null;
    if (!result && roundState === RoundState.DisplayResult) {
        currentResult = roundHistory[0].result;
    } else if (result) {
        currentResult = result;
    }

    return (
        <div className={Style["result-container"]}>
            <div className={Style["result"]}>
                <Cage
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
                    {...props}
                />
            </div>
        </div>
    );
};

export default memo(NextBallResultBlock);
