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

export const RedAndBlueStatisticSubRoundCounter: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoicesClass, subChoices } = props;
    const countedSubChoices = countResult(roundHistory.slice(-30));
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    const [activeScoreboardTab, setActiveScoreboardTab] = useState(true);

    return (
        <div className={`flex items-center gap-2 ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div onClick={() => setActiveScoreboardTab(true)} className={Styles["statistic-choices"]}>
                <StatisticMainChoices {...props} />
            </div>

            <div className={`${Styles["statistic-choices"]} ${Styles["other-wrapper"]}`} onClick={() => setActiveScoreboardTab(false)}>
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
