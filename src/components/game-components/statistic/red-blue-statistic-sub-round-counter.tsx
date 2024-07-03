import { countResult } from ".";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { sicBallChoicesMapper } from "../../../games/sic-ball/types";
import BeadBoardIcon from "./beadboard-icon";
import StatisticItem from "./statistic-item";
import StatisticMainChoices from "./statistic-main-choices";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const RedAndBlueStatisticSubRoundCounter: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoices } = props;
    const { isScoreboardTab } = useGameStateContext();
    const countedSubChoices = countResult(roundHistory.slice(-30));
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();

    const handleTabClick = (isScoreboardTab: boolean) => {
        clickSound();
        dispatch({
            type: GameEventActionType.ACTIVE_SCORE_BOARD_TAB,
            payload: { isScoreboardTab },
        });
    };

    return (
        <div className={`flex items-center gap-2 ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div onClick={() => handleTabClick(true)} className={`${Styles["statistic-choices"]} ${isScoreboardTab ? Styles["selected"] : ""}`}>
                <StatisticMainChoices {...props} />
            </div>

            <div
                className={`${Styles["statistic-choices"]} ${Styles["other-wrapper"]} ${!isScoreboardTab ? Styles["selected"] : ""}`}
                onClick={() => handleTabClick(false)}
            >
                {subChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${countedSubChoices[sicBallChoicesMapper[choice]] ?? 0}`}>
                        <BeadBoardIcon choice={choice} />
                    </StatisticItem>
                ))}
            </div>
        </div>
    );
};
export default RedAndBlueStatisticSubRoundCounter;
