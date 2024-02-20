import { useTranslation } from "next-i18next";
import { useGameContext } from "../../../_shared/react-contexts/game-context/game-context";
import { GameState } from "../../game-base/type";
import Loader from "../loader";
import styles from "./countdown-timer.module.scss";
import { useEffect, useState } from "react";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer = () => {
    const { gameState } = useGameStateContext();
    const { t } = useTranslation("common");
    console.log(`GameState: ${GameState[gameState]}`);

    switch (gameState) {
        case GameState.BeforeStartRound:
            return <></>;
        case GameState.InRound:
            return (
                <>
                    {/* <div className={`loader-show-result`}></div> */}
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
    const { durations } = ctx.gameSetting;
    const { gameState, remainingTime } = useGameStateContext();
    const initialRemainingTime = gameState === GameState.BeforeStartRound ? durations.placingBets : remainingTime;
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
            <div className={`${styles["countdown-timer"]} ${gameState === GameState.LockingBet ? styles["lock-bet"] : ""}`}>
                <span>{seconds}</span>
            </div>
        </div>
    );
};

const GameStatus: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const gameStateContextModel = useGameStateContext();
    const { drawId } = gameStateContextModel;
    const numberOfTurnsPerRound = 4;
    const turn = drawId % numberOfTurnsPerRound || numberOfTurnsPerRound;

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{turn} Draw:</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
