import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import OtherCage from "../../components/game-components/cage-other";
import Style from "./se-ball.module.scss";
import { SeBallResult } from "./types";

export type SeBallResultBlockProps = Partial<GameStateContextModel>;

const SeBallResultBlock: FC<SeBallResultBlockProps> = (props: SeBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SeBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    let zoomClass = "";
    if (roundState === RoundState.DisplayResult) {
        zoomClass = Style["zoom-out"];
    }

    if (roundState === RoundState.BeforePlaceBet) {
        zoomClass = Style["zoom-in"];
    }

    return (
        <div
            className={`${Style["result-container"]} ${zoomClass} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? `showResultContainer ` : ""
            }`}
        >
            <OtherCage
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                playResultAnimation={playResultAnimation}
                ballFPS={25}
            />
        </div>
    );
};

export default memo(SeBallResultBlock);
