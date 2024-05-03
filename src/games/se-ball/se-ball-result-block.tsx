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

    console.log("currentResult", currentResult);

    return (
        <div className={Style["result-container"]}>
            <Cage
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                delayShowResultTime={0}
                playResultAnimation={playResultAnimation}
                roundState={roundState}
            />

            <div className={Style["result-right"]}>
                <ResultSlotContainer
                    defaultRoundData={defaultRoundData}
                    delayTime={0}
                    betChoice={""}
                    className="balls"
                    betChoiceBalls="balls"
                    {...props}
                />
                <h1 className={Style["total"]}>23</h1>
            </div>
        </div>
    );
};

export default memo(SeBallResultBlock);
