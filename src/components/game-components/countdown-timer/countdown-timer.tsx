import { useEffect, useState } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer = () => {
    const { roundState } = useGameStateContext();
    const { t } = useSNTranslate();

    switch (roundState) {
        case RoundState.BeforeStartRound:
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
    const [classNames, setClassNames] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
            if (timeLeft === 0) {
                clearInterval(timer);
            }
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, [timeLeft]);


    useEffect(() => {
        setClassNames(roundState === RoundState.LockingBet ? styles["lock-bet"] : '');
    }, [roundState]);

    return (
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

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setDisplayedTurnId(turnCounter);
        }
    }, [roundState, turnCounter]);

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{displayedTurnId} Draw:</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
