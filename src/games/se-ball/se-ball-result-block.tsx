import { FC, memo } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import Cage, { CageColor, CagePosition } from "../../components/game-components/cage";
import { NormalRoundResultSlotContainer } from "../../components/game-components/normal-round-result-container/normal-round-result-container";
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
                <NormalRoundResultSlotContainer
                    defaultRoundData={defaultRoundData}
                    className="balls"
                    roundResult={currentResult?.balls}
                    {...props}
                />
                <h1 className={Style["total"]}>23</h1>
            </div>
        </div>
    );
};

export default memo(SeBallResultBlock);
