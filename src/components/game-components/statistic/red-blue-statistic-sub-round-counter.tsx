import { useState } from "react";
import { countResult } from ".";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../_shared/react-hooks";
import { sicBallChoicesMapper } from "../../../games/sic-ball/types";
import BeadBoardIcon from "./beadboard-icon";
import StatisticItem from "./statistic-item";
import StatisticMainChoices from "./statistic-main-choices";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const RedAndBlueStatisticSubRoundCounter: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoices } = props;
    const countedSubChoices = countResult(roundHistory.slice(-30));
    const dispatch = useGameStatesDispatch();
    const [selectedTab, setSelectedTab] = useState(true);
    const clickSound = useClickSound();

    const activeScoreboardTabFc = (isScoreboardTab: boolean) => {
        dispatch({
            type: GameEventActionType.ACTIVE_SCORE_BOARD_TAB,
            payload: { isScoreboardTab },
        });
    };

    const handleTabClick = (isMainTab: boolean) => {
        clickSound();
        setSelectedTab(isMainTab);
        activeScoreboardTabFc(isMainTab);
    };

    return (
        <div className={`flex items-center gap-2 ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div onClick={() => handleTabClick(true)} className={`${Styles["statistic-choices"]} ${selectedTab ? Styles["selected"] : ""}`}>
                <StatisticMainChoices {...props} />
            </div>

            <div
                className={`${Styles["statistic-choices"]} ${Styles["other-wrapper"]} ${!selectedTab ? Styles["selected"] : ""}`}
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
