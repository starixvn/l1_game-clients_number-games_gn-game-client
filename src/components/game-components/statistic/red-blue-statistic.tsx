import { calculatePercent, countSettlementResult } from ".";
import { useGameContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const RedAndBlueStatistic: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { statisticRuleEntries, roundHistory, subChoicesStatisticRuleEntries, subChoicesClass } = props;
    const counted = countSettlementResult(roundHistory);
    const mainChoicesStatistic = calculatePercent(statisticRuleEntries, counted, roundHistory.length);
    const subChoicesStatistic = calculatePercent(subChoicesStatisticRuleEntries, counted, roundHistory.length);
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={`flex ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div className={Styles["other-wrapper"]}>
                {Object.keys(mainChoicesStatistic).map((choice) => (
                    <StatisticItem key={choice} value={`${mainChoicesStatistic[choice]}%`}>
                        <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}  ${props.className}`}>
                            {t(`beadboard_${choice}`)}
                        </span>
                    </StatisticItem>
                ))}
            </div>

            <div className={Styles["other-wrapper"]}>
                {Object.keys(subChoicesStatistic).map((choice) => (
                    <StatisticItem key={choice} value={`${subChoicesStatistic[choice]}%`}>
                        <span className={subChoicesClass[choice]}></span>
                    </StatisticItem>
                ))}
            </div>
        </div>
    );
};
export default RedAndBlueStatistic;
