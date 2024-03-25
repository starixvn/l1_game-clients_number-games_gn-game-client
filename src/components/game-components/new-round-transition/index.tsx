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
            <div className={Styles["transition-layer"]}>
                <div className={Styles["loader"]}>
                    <div className={Styles["bar1"]}></div>
                    <div className={Styles["bar2"]}></div>
                    <div className={Styles["bar3"]}></div>
                    <div className={Styles["bar4"]}></div>
                    <div className={Styles["bar5"]}></div>
                    <div className={Styles["bar6"]}></div>
                </div>
            </div>
        </div>
    );
};

export default NewRoundTransition;
