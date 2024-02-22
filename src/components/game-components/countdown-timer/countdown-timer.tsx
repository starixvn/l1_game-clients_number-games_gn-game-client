import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import { useGameContext } from "../../../_shared/react-contexts/game-context/game-context";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer = () => {
    const { roundState } = useGameStateContext();
    const { t } = useTranslation("common");

    switch (roundState) {
        case RoundState.BeforeStartRound:
        case RoundState.SwitchRound:
            return <></>;
        case RoundState.InRound:
            return (
                <>
                    {/* <div className={`loader-show-result`}></div> */}
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("startBetting")}</div>
                    </GameStatus>
                </>
            );
        case RoundState.LockingBet:
            return (
                <>
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["no-more-bets"]}>{t("noMoreBets")}</div>
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
                        <div className={styles["open-result"]}>{t("openResult")}</div>
                    </GameStatus>
                </>
            );
    }
};

const SimpleTimer = () => {
    const ctx = useGameContext();
    const { durations } = ctx;
    const { roundState, remainingTime } = useGameStateContext();
    const initialRemainingTime = roundState === RoundState.BeforeStartRound ? durations.placingBets : remainingTime;
    const [timeLeft, setTimeLeft] = useState(initialRemainingTime);

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
    }, []);

    const seconds = (timeLeft % 60).toString().padStart(2, "0");

    return (
        <div className={styles.timer}>
            <div className={`${styles["countdown-timer"]} ${roundState === RoundState.LockingBet ? styles["lock-bet"] : ""}`}>
                <span>{seconds}</span>
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const gameStateContextModel = useGameStateContext();

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{gameStateContextModel.turnCounter} Draw:</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
