import StatisticIcon from "../statistic-icon";
import Styles from "./round-result.module.scss";

const RoundResult = (data: any) => {
    return (
        <div className={`${Styles["round-result-container"]}  flex justify-between`}>
            <div className="flex items-center gap-2">
                <span className="id">#{data.roundId}</span>
                {data.resultData.map((items: any) => (
                    <div className={`${Styles["result"]} flex items-center`} key={items.betChoiceShort}>
                        <span>{items.count}</span>
                        <StatisticIcon betChoice={items.betChoiceShort} bgColor={items.color} />
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RoundResult;
