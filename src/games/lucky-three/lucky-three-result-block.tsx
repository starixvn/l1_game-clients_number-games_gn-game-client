import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import Style from "./lucky-three.module.scss";
import { LuckyThreeResult } from "./types";

export type LuckyThreeResultBlockProps = Partial<GameStateContextModel>;

const LuckyThreeResultBlock: FC<LuckyThreeResultBlockProps> = (props: LuckyThreeResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<LuckyThreeResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.SwitchRound && !isPlayStartRoundAnimation) {
        return <></>;
    }

    let zoomClass = "zoom-in";

    if (
        roundState === RoundState.Disabled ||
        roundState === RoundState.BeforePlaceBet ||
        (roundState === RoundState.DisplayResult && playResultAnimation)
    ) {
        zoomClass = Style["zoom-out"];
    }

    if (roundState === RoundState.DisplayResult && !playResultAnimation) {
        zoomClass = Style["zoom-out-no-animation"];
    }

    return (
        <div
            className={`${Style["result-container"]} ${zoomClass} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? `showResultContainer ` : ""
            }`}
        >
            <CageResultList
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                playResultAnimation={playResultAnimation}
                gameFolder="lucky-three"
                highlightBallSize={{ width: 478, height: 246 }}
                roundState={roundState}
                ballFPS={25}
            />
        </div>
    );
};

export default memo(LuckyThreeResultBlock);
