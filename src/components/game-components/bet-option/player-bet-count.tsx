import isEmpty from "lodash/isEmpty";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./bet-option.module.scss";
import { BaseProps } from "./types";

export const PlayerBetCount: React.FC<BaseProps> = ({ tolgeeNamespace, choice, className }) => {
    const { playerBetCount } = useGameBettingZoneContext();
    const { roundState } = useGameStateContext();

    if (isEmpty(playerBetCount) || roundState === RoundState.SwitchRound) {
        return <></>;
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

export default PlayerBetCount;
