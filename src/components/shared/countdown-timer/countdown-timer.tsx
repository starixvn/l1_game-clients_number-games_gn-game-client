import { useTranslation } from "next-i18next";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

import { useGameContext } from "../../../contexts/game-context/game-context";
import { GameState } from "../game-base/type";
import Loader from "../loader";
import styles from "./countdown-timer.module.scss";

export type Rotation = "clockwise" | "counterclockwise";
const CountdownTimer: React.FC = () => {
    const { gameState, gameSetting } = useGameContext();
    const gameName = gameSetting.gameName.toLocaleLowerCase();
    const { t } = useTranslation("common");
    switch (gameState) {
        case GameState.BeforeStartRound:
            return <Timer />;
        case GameState.InRound:
            return (
                <>
                    <Timer />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("startBetting")}</div>
                    </GameStatus>
                </>
            );
        case GameState.LockingBet:
            return (
                <>
                    <Timer />
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

const Timer = () => {
    const ctx = useGameContext();
    const gameName = ctx.gameSetting.gameName.toLocaleLowerCase();
    const { durations } = ctx.gameSetting;

    const timerProps = {
        isPlaying: ctx.gameState !== GameState.BeforeStartRound,
        size: 30,
        strokeWidth: 3,
        trailColor: "#fff",
        trailStrokeWidth: 1,
        initialRemainingTime: ctx.gameState === GameState.BeforeStartRound ? durations.placingBets : ctx.remainingTime,
        duration: durations.placingBets,
        rotation: "counterclockwise" as Rotation,
    };

    return (
        <div className={`${styles.timer} ${styles[gameName]}`}>
            {/* <CountdownCircleTimer {...timerProps} colors={[[ctx.gameState === GameState.LockingBet ? "#FF7B7B" : "#15E84B", 1]]}>
                {({ remainingTime }) => {
                    if (remainingTime === 0) {
                        return (1).toLocaleString("en-US", { minimumIntegerDigits: 2 });
                    }
                    return remainingTime.toLocaleString("en-US", { minimumIntegerDigits: 2 });
                }}
            </CountdownCircleTimer> */}
        </div>
    );
};

const GameStatus: React.FC<{ children: React.ReactNode }> = ({ children }: { children: React.ReactNode }) => {
    const { gameSetting } = useGameContext();
    const gameName = gameSetting.gameName.toLocaleLowerCase();
    return <div className={`${styles["game-status"]} ${styles[gameName]}`}>{children}</div>;
};

export default CountdownTimer;
