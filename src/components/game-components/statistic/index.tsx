import React, { memo } from "react";

import { Round } from "../../game-base/type";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps, Props } from "./types";

export const countSettlementResult = (roundHistory: Round<any, any>[]) => {
    return roundHistory.reduce((result, { settlementResult }) => {
        for (const [choice, win] of Object.entries(settlementResult)) {
            if (win) {
                if (result[choice]) {
                    result[choice] = result[choice] + 1;
                } else {
                    result[choice] = 1;
                }
            }
        }
        return result;
    }, {});
};

export const calculatePercent = (
    statisticRuleEntries: [string, (countResult: object, total: number) => number][],
    countResult: object,
    total: number
) => {
    return statisticRuleEntries.reduce((result, [choice, rule]) => {
        result[choice] = rule(countResult, total);
        return result;
    }, {});
};

const StatisticItem: React.FC<Props> = (props) => {
    return (
        <div className={Styles["statistic-group"]}>
            {props.children}
            <span className={Styles["number"]}>{props.value}</span>
        </div>
    );
};

export const PercentageStatistic: React.FC<PercentageStatisticProps> = (props) => {
    const { statisticRuleEntries, roundHistory } = props;
    const counted = countSettlementResult(roundHistory);
    const statisticResult = calculatePercent(statisticRuleEntries, counted, roundHistory.length);

    return (
        <div className={`${Styles["statistic-container"]} flex`} id="bar-statistic">
            {Object.keys(statisticResult).map((choice) => (
                <StatisticItem key={choice} value={`${statisticResult[choice]}%`}>
                    <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}`}>{choice.charAt(0).toUpperCase()}</span>
                </StatisticItem>
            ))}
        </div>
    );
};

export default memo(PercentageStatistic);
