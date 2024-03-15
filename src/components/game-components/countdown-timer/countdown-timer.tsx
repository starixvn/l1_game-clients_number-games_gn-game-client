import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";

export type Rotation = "clockwise" | "counterclockwise";
export const CountdownTimer = ({ SimpleTimerProp = SimpleTimer, GameStatusProp = GameStatus }) => {
    const { roundState } = useGameStateContext();
    const { t } = useSNTranslate();

    switch (roundState) {
        case RoundState.InRound:
            return (
                <>
                    <SimpleTimerProp />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("status_start_bet")}</div>
                    </GameStatus>
                </>
            );
        case RoundState.LockingBet:
            return (
                <>
                    <SimpleTimerProp />
                    <GameStatusProp>
                        <div className={styles["no-more-bets"]}>{t("status_stop_bet")}</div>
                    </GameStatusProp>
                </>
            );

        case RoundState.DisplayResult:
            return (
                <>
                    <div className={`loader-show-result`}></div>
                    <GameStatus>
                        <div className={styles["open-result"]}>{t("status_result")}</div>
                    </GameStatus>
                </>
            );

        case RoundState.None:
            return <div className={`loader-show-result`}></div>;

        default:
            return <></>;
    }
};

export const SimpleTimer = () => {
    const { roundState, remainingTime } = useGameStateContext();

    if (remainingTime <= 0) {
        return <></>;
    }

    return <div className={styles.timer}>
        <div className={`${styles["countdown-timer"]} ${roundState === RoundState.LockingBet ? styles["lock-bet"] : ""}`}>
            <span>{(remainingTime % 60).toString().padStart(2, "0")}</span>
        </div>
    </div>;
};

export const GameStatus = ({ children }) => {
    const { turnCounter } = useGameStateContext();
    const { t } = useSNTranslate();

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{turnCounter > 0 ? t(`draw_${turnCounter}`) : ""}</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
