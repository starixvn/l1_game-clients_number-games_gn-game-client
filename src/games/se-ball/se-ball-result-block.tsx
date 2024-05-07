import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { RoundBaseResultSlotContainer } from "../../components/game-components/round-base-result-container/round-base-result-container";
import { defaultRoundData } from "./se-ball-constants";
import Style from "./se-ball.module.scss";
import { SeBallResult } from "./types";

export type SeBallResultBlockProps = Partial<GameStateContextModel>;

const SeBallResultBlock: FC<SeBallResultBlockProps> = (props: SeBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SeBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    return (
        <div
            className={`${Style["result-container"]} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer" : ""
            }`}
        >
            <Cage
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                delayShowResultTime={0}
                playResultAnimation={playResultAnimation}
                roundState={roundState}
                ballFPS={35}
            />

            <RoundBaseResultSlotContainer
                defaultRoundData={defaultRoundData}
                className="balls"
                roundResult={currentResult?.balls}
                {...props}
            />
        </div>
    );
};

export default memo(SeBallResultBlock);
