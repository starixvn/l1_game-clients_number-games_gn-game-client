import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./new-round-transition.module.scss";

const NewRoundTransition: React.FC<any> = (props) => {
    const { totalTurns, isExtraOneSecond, prevRoundState } = props;
    const { roundState } = useGameStateContext();

    const isPlayAnimRoundBase = [RoundState.BeforePlaceBet].includes(roundState) && totalTurns === 1;
    const isPlayAnimTurnBase = [RoundState.SwitchRound].includes(roundState) && totalTurns > 1;
    const isPlayExtraSwitchRound = prevRoundState === RoundState.SwitchRound && roundState === RoundState.BeforePlaceBet;

    if (isPlayAnimTurnBase || isPlayAnimRoundBase || isPlayExtraSwitchRound) {
        return (
            <div className={`${Styles["new-round-transition"]} ${isExtraOneSecond ? Styles["extra-one-second"] : ""}`}>
                <div className={Styles["transition-layer"]}>
                    <div className={Styles["light"]}></div>
                </div>
            </div>
        );
    }

    return <></>;
};

export default NewRoundTransition;
