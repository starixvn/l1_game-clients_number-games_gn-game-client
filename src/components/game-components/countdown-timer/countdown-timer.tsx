import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { useEffect, useState } from "react";
import { writeDebugLog } from "../../../_shared/helpers";
import { useGameContext } from "../../../_shared/react-contexts";
import { messageEventType } from "../../game-base/handlers";

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
    const { gameMessageHandler } = useGameContext();
    const { roundState } = useGameStateContext();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            if (clientRemainingTime !== timeLeft) {
                setTimeLeft(clientRemainingTime);
            }
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, [timeLeft, gameMessageHandler]);

    return timeLeft <= 0 ? (
        <></>
    ) : (
        <div className={styles.timer}>
            <div className={`${styles["countdown-timer"]} ${roundState !== RoundState.InRound ? styles["lock-bet"] : ""}`}>
                <span>{(timeLeft % 60).toString().padStart(2, "0")}</span>
            </div>
        </div>
    );
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
