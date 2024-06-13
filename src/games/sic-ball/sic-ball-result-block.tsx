import { FC, memo, useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
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

    return (
        <div
            className={`${Style["result-container"]} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
            }`}
        >
            <SicBallResultCage />
            <SicBallResultCage />
            <SicBallResultCage />
            {roundState === RoundState.DisplayResult && (
                <SicBallResultTotalPoint playResultAnimation={playResultAnimation} results={currentResult?.balls} />
            )}
        </div>
    );
};

export default memo(SicBallResultBlock);
