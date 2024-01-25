import React from "react";

import { choicesMapper } from "..";
import { Round } from "../../../types";
import StatisticItem from "../../../components/shared/statistic";
import ChoiceIcon from "../choice-icon";

const countResult = (roundHistory: Round<any, any>[]) => {
    return roundHistory.reduce((resultCount, { result }) => {
        Object.values(result).forEach((character: number) => {
            resultCount[character] = (resultCount[character] ?? 0) + 1;
        });
        return resultCount;
    }, {});
};

const StatisticComponent = ({ roundHistory }) => {
    const statisticResult = countResult(roundHistory.slice(0, 30));

    return (
        <>
            {Object.keys(choicesMapper).map((choice) => {
                return (
                    <StatisticItem key={choice} value={`${statisticResult[choicesMapper[choice]] ?? 0}`}>
                        <ChoiceIcon type={choicesMapper[choice]} isSmall={true}></ChoiceIcon>
                    </StatisticItem>
                );
            })}
        </>
    );
};

export default React.memo(StatisticComponent);
