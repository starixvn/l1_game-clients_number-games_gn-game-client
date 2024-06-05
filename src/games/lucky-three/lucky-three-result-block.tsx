import { FC, memo, useCallback, useEffect, useState } from "react";

import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { CageColor, CagePosition } from "../../components/game-components/cage";
import CageResultList from "../../components/game-components/cage-result-list";
import { TurnBaseResultSlotContainer } from "../../components/game-components/turn-base-result-container/turn-base-result-container";
import { defaultRoundData } from "./lucky-three-constants";
import Style from "./lucky-three.module.scss";
import { LuckyThreeResult } from "./types";

export type LuckyThreeResultBlockProps = Partial<GameStateContextModel>;

const LuckyThreeResultBlock: FC<LuckyThreeResultBlockProps> = (props: LuckyThreeResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation, prevRoundState } = props;
    const currentResult = useResult<LuckyThreeResult>({ result, roundState, roundHistory });

    const [resultStyle, setResultStyle] = useState("");
    // const [showTotalPoint, setShowTotalPoint] = useState(false);

    const showTotalCallback = useCallback((isShow: boolean) => {
        // setShowTotalPoint(isShow);
    }, []);

    useEffect(() => {
        if (roundState === RoundState.InRound || roundState === RoundState.LockingBet) {
            return setResultStyle(``);
        }

        if (roundState === RoundState.BeforePlaceBet && ![RoundState.None, RoundState.SwitchRound].includes(prevRoundState)) {
            return setResultStyle(`${Style["zoom-in-anim"]}`);
        }

        if (roundState === RoundState.Disabled || (roundState === RoundState.DisplayResult && playResultAnimation)) {
            return setResultStyle(`${Style["zoom-out-anim"]}`);
        }

        if (roundState === RoundState.DisplayResult && !playResultAnimation) {
            return setResultStyle(`${Style["zoom-out-no-anim"]}`);
        }

        if (roundState === RoundState.SwitchRound) {
            return setResultStyle(``);
        }
    }, [roundState, playResultAnimation]);

    if (roundState === RoundState.SwitchRound && !isPlayStartRoundAnimation) {
        return <></>;
    }

    const showResultClass = roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? `showResultContainer ` : "";

    return (
        <div className={`${Style["result-container"]} ${resultStyle} ${showResultClass}`}>
            <CageResultList
                color={CageColor.PURPLE}
                position={CagePosition.LEFT}
                isSmall={true}
                listResult={currentResult?.balls}
                playResultAnimation={playResultAnimation}
                gameFolder="lucky-three"
                highlightBallSize={{ width: 478, height: 260 }}
                roundState={roundState}
                ballFPS={25}
                showTotalCallback={showTotalCallback}
            />

            <div className={Style["slot-container"]}>
                <TurnBaseResultSlotContainer
                    defaultRoundData={defaultRoundData}
                    delayTime={4500}
                    betChoice={""}
                    className={Style["group-3"]}
                    betChoiceBalls="balls"
                    groupType={3}
                    delayClassName={Style["delay-show-ball"]}
                    {...props}
                />
            </div>
        </div>
    );
};

export default memo(LuckyThreeResultBlock);
