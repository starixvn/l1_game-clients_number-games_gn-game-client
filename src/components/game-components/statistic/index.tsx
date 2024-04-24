import React, { memo } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
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
        <div className={`${Styles["statistic-group"]} ${props.className}`}>
            {props.children}
            <span className={Styles["number"]}>{props.value}</span>
        </div>
    );
};

export const PercentageStatistic: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { statisticRuleEntries, roundHistory, onSelectGroup, selectedGroup } = props;
    const counted = countSettlementResult(roundHistory);
    const statisticResult = calculatePercent(statisticRuleEntries, counted, roundHistory.length);
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    if (props.group) {
        const choices = Object.keys(statisticResult);
        const groups = [];

        while (choices.length) {
            const choicesInGroup = choices.splice(0, props.group);

            groups.push(
                choicesInGroup.map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`}>
                        <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]} ${props.className}`}>
                            {t(`beadboard_${choice}`)}
                        </span>
                    </StatisticItem>
                ))
            );
        }

        return (
            <div className={`${Styles["statistic-container"]} flex ${Styles["statistic-tab-container"]}`} id="bar-statistic">
                {groups.map((choices, index) => (
                    <div
                        key={index}
                        className={`${Styles["statistic-choices"]} ${index === selectedGroup ? Styles.selected : ""}`}
                        onClick={() => onSelectGroup && onSelectGroup(index)}
                    >
                        {choices}
                    </div>
                ))}
            </div>
        );
    } else {
        return (
            <div className={`${Styles["statistic-container"]} flex`} id="bar-statistic">
                {Object.keys(statisticResult).map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`} className={props.className}>
                        <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}`}>{t(`beadboard_${choice}`)}</span>
                    </StatisticItem>
                ))}
            </div>
        );
    }
};

export default memo(PercentageStatistic);
