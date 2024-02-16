import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { Round } from "../../game-base/type";
import Styles from "./statistic.module.scss";
import { Props, PropsFollowPercent } from "./types";

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

export const StatisticFollowPercent: React.FC<PropsFollowPercent> = (props) => {
    const { statisticRuleEntries, roundHistory, activeScoreboardTab } = props;
    const { gameSetting } = useGameContext();
    const gameName = gameSetting.gameName.toLowerCase();
    const { t } = useTranslation(gameName);
    console.log("statisticRuleEntries", statisticRuleEntries);

    return useMemo(() => {
        const statisticResult = calculatePercent(statisticRuleEntries, countSettlementResult(roundHistory), roundHistory.length);

        return (
            <>
                {Object.keys(statisticResult).map((choice) => (
                    <StatisticItem key={choice} value={`${statisticResult[choice]}%`}>
                        <span className={`${Styles[choice]} ${Styles[gameName]}`}>{t(choice)}</span>
                    </StatisticItem>
                ))}
            </>
        );
    }, [roundHistory, statisticRuleEntries, activeScoreboardTab]);
};

export default StatisticItem;
