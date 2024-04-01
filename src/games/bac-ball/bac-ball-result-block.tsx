import { FC, memo, useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { BacBallResultSlotContainer } from "./bac-ball-result-slot-container";
import Style from "./bac-ball.module.scss";
import { BacBallBetOptions } from "./constants";

export type BacBallResultBlockProps = Partial<GameStateContextModel>;

export const BacBallResultBlock: FC<BacBallResultBlockProps> = (props: BacBallResultBlockProps) => {
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

    return (
        <div className={Style["result-container"]}>
            <div className={Style["result"]}>
                <Cage
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
