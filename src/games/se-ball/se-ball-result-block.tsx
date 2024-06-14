import { FC, memo, useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import Style from "./se-ball.module.scss";
import { SeBallResult } from "./types";

export type SeBallResultBlockProps = Partial<GameStateContextModel>;

const SeBallResultBlock: FC<SeBallResultBlockProps> = (props: SeBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SeBallResult>({ result, roundState, roundHistory });
    const [zoomClass, setZoomClass] = useState(`${Style["zoom-out-no-animation"]}`);

    useEffect(() => {
        if (roundState === RoundState.Disabled || (roundState === RoundState.DisplayResult && playResultAnimation)) {
            setZoomClass(`${Style["zoom-out"]}`);
        }

        if (roundState === RoundState.InRound || roundState === RoundState.LockingBet) {
            setZoomClass(`${Style["zoom-in"]}`);
        }

        if (roundState === RoundState.DisplayResult && !playResultAnimation) {
            setZoomClass(`${Style["zoom-out-no-animation"]}`);
        }
    }, [roundState, playResultAnimation]);

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    return (
        <div
            className={`${Style["result-container"]} ${zoomClass} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
            }`}
        >
            <CageResultList
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                playResultAnimation={playResultAnimation}
                gameFolder="se-ball"
                highlightBallSize={{ width: 624, height: 216 }}
                roundState={roundState}
            />
        </div>
    );
};

export default memo(SeBallResultBlock);
