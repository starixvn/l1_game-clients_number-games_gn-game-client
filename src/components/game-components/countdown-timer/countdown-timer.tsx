import { useTranslation } from "next-i18next";
import { useGameContext } from "../../../_shared/react-contexts/game-context/game-context";
import { GameState } from "../../game-base/type";
import Loader from "../loader";
import styles from "./countdown-timer.module.scss";
import { useEffect, useState } from "react";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer: React.FC = () => {
    const { gameState, gameSetting } = useGameContext();
    const gameName = gameSetting.gameName.toLocaleLowerCase();
    const { t } = useTranslation("common");

    switch (gameState) {
        case GameState.BeforeStartRound:
            return <></>;
        case GameState.InRound:
            return (
                <>
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("startBetting")}</div>
                    </GameStatus>
                </>
            );
        case GameState.LockingBet:
            return (
                <>
                    <SimpleTimer />
                    <GameStatus>
                        <div className={styles["no-more-bets"]}>{t("noMoreBets")}</div>
                    </GameStatus>
                </>
            );
        case GameState.BalancingBet:
            return (
                <>
                    <div className="loader-balance-pool"></div>
                    <GameStatus>
                        <div className={styles["balanced-betting-pool"]}>{t("balancedBettingPool")}</div>
                    </GameStatus>
                </>
            );
        case GameState.None:
            return <Loader />;

        default:
            return (
                <>
                    <div className={`loader-show-result ${gameName}`}></div>
                    <GameStatus>
                        <div className={styles["open-result"]}>{t("openResult")}</div>
                    </GameStatus>
                </>
            );
    }
};

const SimpleTimer = () => {
    const ctx = useGameContext();
    const { durations } = ctx.gameSetting;
    const initialRemainingTime = ctx.gameState === GameState.BeforeStartRound ? durations.placingBets : ctx.remainingTime;
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
            <div className={`${styles["countdown-timer"]} ${ctx.gameState === GameState.LockingBet ? styles["lock-bet"] : ""}`}>
                <span>00:</span>
                <span>{seconds}</span>
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const { gameSetting, drawId } = useGameContext();
    const gameName = gameSetting.gameName.toLocaleLowerCase();
    const numberOfTurnsPerRound = 4;
    const turn = drawId % numberOfTurnsPerRound || numberOfTurnsPerRound;
    console.log("gameName", drawId, turn);

    return (
        <div className={`${styles["game-status"]} ${styles[gameName]}`}>
            <span>{turn} Draw:</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
