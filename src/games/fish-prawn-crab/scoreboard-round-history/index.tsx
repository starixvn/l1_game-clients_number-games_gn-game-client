import React from "react";

import IconColumn from "../../../components/shared/round-history/icon-column";
import ChoiceIcon from "../choice-icon";

const GetScoreboardDotDetails = (result: any, roundId: number) => {
    const itemValues = Object.values(result);
    return (
        <IconColumn key={roundId}>
            {itemValues.map((value: number, index) => {
                return <ChoiceIcon key={`${roundId}_${index}`} type={value}></ChoiceIcon>;
            })}
        </IconColumn>
    );
};

export default GetScoreboardDotDetails;
