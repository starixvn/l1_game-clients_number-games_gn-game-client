import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import Styles from "./new-round-transition.module.scss";

export const NewRoundTransitionWithoutExtraSeconds = () => {
    const { roundState } = useGameStateContext();

    if ([RoundState.SwitchRound, RoundState.BeforePlaceBet].includes(roundState)) {
        return <NewRoundTransition />
    }

    return <></>;
};

export const NewRoundTransitionWithinExtraSeconds = () => {
    const { prevRoundState, roundState } = useGameStateContext();

    if ((prevRoundState === RoundState.SwitchRound && roundState === RoundState.BeforePlaceBet)
        || roundState === RoundState.SwitchRound) {
        return <NewRoundTransition isExtraOneSecond={true} />
    }

    return <></>;
};

const NewRoundTransition = ({ isExtraOneSecond = false }) => {
    return (
        <div className={`${Styles["new-round-transition"]} ${isExtraOneSecond ? Styles["extra-one-second"] : ""}`}>
            <div className={Styles["transition-layer"]}>
                <div className={Styles["light"]}></div>
            </div>
        </div>
    );
};

