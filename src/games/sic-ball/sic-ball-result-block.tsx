import { FC, memo, useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import SicBallResultBottom from "./sic-ball-result-bottom";
import SicBallResultItem from "./sic-ball-result-item";
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
            <SicBallResultItem showBallDelayTime={0} ballNumber={1} />
            <SicBallResultItem showBallDelayTime={1000} ballNumber={2} />
            <SicBallResultItem showBallDelayTime={2000} ballNumber={1} />
            <SicBallResultBottom />
        </div>
    );
};

export default memo(SicBallResultBlock);
