import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const PlayerBetCount: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { playerBetCount } = useGameBettingZoneContext();
    const playerCount = playerBetCount?.[choice] ?? 0;

    if (playerCount == 0) {
        return <div className={className}></div>;
    }

    return (
        <div className={`${className} ${Styles["player-count"]} `}>
            <span className="icon-user"></span>
            <span className={Styles["player-count-value"]} id={`${tolgeeNamespace}-${choice}-no`}>
                {playerBetCount[choice]}
            </span>
        </div>
    );
};
