import { FC, memo, useEffect, useMemo, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import SicBallResultBalls from "./sic-ball-result-balls";
import SicBallResultCage from "./sic-ball-result-cage";
import SicBallResultTotalPoint from "./sic-ball-result-total-point";
import Style from "./sic-ball.module.scss";
import { SicBallResult } from "./types";

export type SicBallResultBlockProps = Partial<GameStateContextModel>;

const SicBallResultBlock: FC<SicBallResultBlockProps> = (props: SicBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SicBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    let zoomClass = "";

    if (roundState === RoundState.DisplayResult) {
        zoomClass = `${Style["zoom-out-anim"]}`;
    }

    if (roundState === RoundState.DisplayResult && !playResultAnimation) {
        zoomClass = `${Style["zoom-out-no-anim"]}`;
    }

    return (
        <div
            className={`${Style["result-container"]} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
            }`}
        >
            <div className={`${Style["cage-list"]} ${zoomClass}`}>
                <SicBallResultCage startFrame={0} />
                <SicBallResultCage startFrame={5} />
                <SicBallResultCage startFrame={10} />

                <SicBallResultBalls roundState={roundState} playResultAnimation={playResultAnimation} results={currentResult?.balls} />
            </div>

            <SicBallResultTotalPoint roundState={roundState} playResultAnimation={playResultAnimation} results={currentResult?.balls} />
        </div>
    );
};

export default memo(SicBallResultBlock);
