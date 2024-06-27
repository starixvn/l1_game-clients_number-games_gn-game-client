import { useState } from "react";
import { countResult } from ".";
import { useGameContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { sicBallChoicesMapper } from "../../../games/sic-ball/types";
import StatisticItem from "./statistic-item";
import StatisticMainChoices from "./statistic-main-choices";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";
import BeadBoardIcon from "./beadboard-icon";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

export const RedAndBlueStatisticSubRoundCounter: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoices } = props;
    const countedSubChoices = countResult(roundHistory.slice(-30));
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);
    const dispatch = useGameStatesDispatch();
    const [activeScoreboardTab, setActiveScoreboardTab] = useState(true);

    const activeScoreboardTabFc = (isScoreboardTab: boolean) => {
        setActiveScoreboardTab(isScoreboardTab);
        dispatch({
            type: GameEventActionType.ACTIVE_SCORE_BOARD_TAB,
            payload: { isScoreboardTab },
        });
    };

    return (
        <div className={`flex items-center gap-2 ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div onClick={() => activeScoreboardTabFc(true)} className={Styles["statistic-choices"]}>
                <StatisticMainChoices {...props} />
            </div>

            <div className={`${Styles["statistic-choices"]} ${Styles["other-wrapper"]}`} onClick={() => activeScoreboardTabFc(false)}>
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
