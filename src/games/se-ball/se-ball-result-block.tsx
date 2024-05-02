import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { ResultSlotContainer } from "../../components/game-components/result-container/result-container";
import { defaultRoundData } from "./se-ball-constants";
import Style from "./se-ball.module.scss";
import { SeBallResult } from "./types";

export type SeBallResultBlockProps = Partial<GameStateContextModel>;

const SeBallResultBlock: FC<SeBallResultBlockProps> = (props: SeBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation } = props;
    const currentResult = useResult<SeBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.SwitchRound) {
        return <></>;
    }

    return (
        <div className={Style["result-container"]}>
            <div className={Style["result"]}>
                <Cage
                    color={CageColor.PURPLE}
                    position={CagePosition.CENTER}
                    isSmall={true}
                    result={currentResult?.ball}
                    delayShowResultTime={0}
                    playResultAnimation={playResultAnimation}
                    roundState={roundState}
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

export default memo(SeBallResultBlock);
