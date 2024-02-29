import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./new-round-transition.module.scss";

const NewRoundTransition: React.FC<any> = (props) => {
    const { roundState } = useGameStateContext();

    if (roundState !== RoundState.SwitchRound) {
        return <></>;
    }

    return (
        <div className={Styles["new-round-transition"]}>
            <div className={Styles.bg}></div>
        </div>
    );
};

export default NewRoundTransition;
