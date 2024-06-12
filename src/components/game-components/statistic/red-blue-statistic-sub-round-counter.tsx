import { countSettlementResult, countResult, getPercentage } from ".";
import { useGameContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { sicBallChoicesMapper } from "../../../games/sic-ball/types";
import StatisticItem from "./statistic-item";
import Styles from "./statistic.module.scss";
import { PercentageStatisticProps } from "./types";

export const RedAndBlueStatisticSubRoundCounter: React.FC<PercentageStatisticProps> = (props: PercentageStatisticProps) => {
    const { roundHistory, subChoicesClass, mainChoices, subChoices } = props;
    const countedMainChoices = countSettlementResult(roundHistory);
    const countedSubChoices = countResult(roundHistory.slice(-30));
    const mainChoicesStatistic = getPercentage(mainChoices, countedMainChoices, roundHistory.length);
    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={`flex ${Styles["statistic-container"]} ${Styles["other"]}`} id="bar-statistic">
            <div className={Styles["other-wrapper"]}>
                {mainChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${mainChoicesStatistic[choice]}%`}>
                        <span className={`${Styles[choice]} ${Styles["statistic-choice-icon"]}  ${props.className}`}>
                            {t(`beadboard_${choice}`)}
                        </span>
                    </StatisticItem>
                ))}
            </div>

            <div className={Styles["other-wrapper"]}>
                {subChoices.map((choice) => (
                    <StatisticItem key={choice} value={`${countedSubChoices[sicBallChoicesMapper[choice]] ?? 0}`}>
                        <span className={subChoicesClass[choice]}></span>
                    </StatisticItem>
                ))}
            </div>
        </div>
    );
};
export default RedAndBlueStatisticSubRoundCounter;
