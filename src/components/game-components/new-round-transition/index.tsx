import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./new-round-transition.module.scss";

const NewRoundTransition: React.FC<any> = (props) => {
    const { totalTurns } = props;
    const { roundState } = useGameStateContext();

    const isPlayAnimRoundBase = [RoundState.BeforePlaceBet].includes(roundState) && totalTurns === 1;
    const isPlayAnimTurnBase = [RoundState.SwitchRound].includes(roundState) && totalTurns > 1;

    if (isPlayAnimTurnBase || isPlayAnimRoundBase) {
        return (
            <div className={Styles["new-round-transition"]}>
                <div className={Styles["transition-layer"]}>
                    <div className={Styles["light"]}></div>
                </div>
            </div>
        );
    }

    return <></>;
};

export default NewRoundTransition;
