import { calculatePercent, countSettlementResult } from ".";
import { useGameContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const RedAndBlueStatistic: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { statisticRuleEntries, roundHistory, otherStatisticRuleEntries, subBetOptionClass } = props;
    const counted = countSettlementResult(roundHistory);
    const statisticResult = calculatePercent(statisticRuleEntries, counted, roundHistory.length);
    const otherStatisticResult = calculatePercent(otherStatisticRuleEntries, counted, roundHistory.length);
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={`flex ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div className={Styles["other-wrapper"]}>
                {Object.keys(statisticResult).map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`}>
                        <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}  ${props.className}`}>
                            {t(`beadboard_${choice}`)}
                        </span>
                    </StatisticItem>
                ))}
            </div>

            <div className={Styles["other-wrapper"]}>
                {Object.keys(otherStatisticResult).map((choice) => (
                    <StatisticItem key={choice} value={`${otherStatisticResult[choice]}%`}>
                        <span className={subBetOptionClass[choice]}></span>
                    </StatisticItem>
                ))}
            </div>
        </div>
    );
};
export default RedAndBlueStatistic;
