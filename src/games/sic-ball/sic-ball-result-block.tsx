import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import Style from "./sic-ball.module.scss";
import { SicBallResult } from "./types";

export type SicBallResultBlockProps = Partial<GameStateContextModel>;

const SicBallResultBlock: FC<SicBallResultBlockProps> = (props: SicBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SicBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    let zoomClass = "zoom-in";

    if (roundState === RoundState.Disabled || (roundState === RoundState.DisplayResult && playResultAnimation)) {
        zoomClass = Style["zoom-out"];
    }

    if (roundState === RoundState.DisplayResult && !playResultAnimation) {
        zoomClass = Style["zoom-out-no-animation"];
    }

    return (
        <div
            className={`${Style["result-container"]} ${zoomClass} ${roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
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

export default memo(SicBallResultBlock);
