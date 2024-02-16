import StatisticIcon from "../statistic-icon";
import Styles from "./round-result.module.scss";

const countResult = (data, prop) => {
    let count = 0;
    data.forEach((item) => {
        if (item.settlementResult[prop]) {
            count++;
        }
    });

    return count;
};

const RoundResult = ({ roundHistory, statisticData }) => {
    return (
        <div className={`${Styles["round-result-container"]} flex`}>
            {statisticData.map((item) => {
                return (
                    <div className={`${Styles["result"]} flex items-center`} key={item.betChoice}>
                        <span>{countResult(roundHistory, item.betChoice)}%</span>
                        <StatisticIcon betChoice={item.betChoiceShort} bgColor={item.color} />
                    </div>
                );
            })}
        </div>
    );
};
export default RoundResult;
