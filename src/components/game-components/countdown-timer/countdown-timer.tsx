import { useEffect, useState } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { writeDebugLog } from "../../../_shared/helpers";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer = () => {
    const { roundState } = useGameStateContext();
    const { t } = useSNTranslate();

    switch (roundState) {
        case RoundState.BeforePlaceBet:
        case RoundState.SwitchRound:
            return <></>;
        case RoundState.InRound:
            return (
                <>
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("status_start_bet")}</div>
                    </GameStatus>
                </>
            );
        case RoundState.LockingBet:
            return (
                <>
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["no-more-bets"]}>{t("status_stop_bet")}</div>
                    </GameStatus>
                </>
            );

        case RoundState.None:
            return <div className={`loader-show-result`}></div>;

        default:
            return (
                <>
                    <div className={`loader-show-result`}></div>
                    <GameStatus>
                        <div className={styles["open-result"]}>{t("status_result")}</div>
                    </GameStatus>
                </>
            );
    }
};

const SimpleTimer = () => {
    const { roundState, remainingTime } = useGameStateContext();
    const [timeLeft, setTimeLeft] = useState(remainingTime);
    const [classNames, setClassNames] = useState("");

    useEffect(() => {
        if (remainingTime !== timeLeft) {
            writeDebugLog({ timeLeft, remainingTime, roundState: RoundState[roundState] });
            setTimeLeft(remainingTime);
            setClassNames(roundState === RoundState.LockingBet ? styles["lock-bet"] : "");
        }
    }, [timeLeft, remainingTime, roundState]);

    return remainingTime <= 0 ? (
        <></>
    ) : (
        <div className={styles.timer}>
            <div className={`${styles["countdown-timer"]} ${classNames}`}>
                <span>{(timeLeft % 60).toString().padStart(2, "0")}</span>
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const { turnCounter, roundState } = useGameStateContext();
    const [displayedTurnId, setDisplayedTurnId] = useState(turnCounter);
    const { t } = useSNTranslate();

    useEffect(() => {
        setDisplayedTurnId(turnCounter);
    }, [roundState, turnCounter]);

    const turnCounterText = displayedTurnId > 0 ? t(`draw_${displayedTurnId}`) : "";

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{turnCounterText}</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
