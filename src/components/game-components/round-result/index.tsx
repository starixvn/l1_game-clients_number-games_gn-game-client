import { FC, useContext } from "react";
import StatisticIcon from "../statistic-icon";
import Styles from "./round-result.module.scss";
import { RoundResultData } from "../../../_shared/constants";
import { GameContext } from "../../../_shared/react-contexts";

const RoundResult: FC<{ results: RoundResultData[] }> = ({ results }) => {
    const gameContext = useContext(GameContext);

    return (
        <div className={`${Styles["round-result-container"]}  flex justify-between`}>
            <div className="flex items-center gap-2">
                <span className="id">#{gameContext.roundId}</span>
                {results.map((items: any) => (
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
