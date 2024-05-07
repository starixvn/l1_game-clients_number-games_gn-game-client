import { useEffect, useState } from "react";

import { getGameSettings } from "../../../_shared/app-settings";
import { useGameContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useBlockBetSound } from "../../../_shared/react-hooks";
import { useSNTranslate } from "../../../_shared/react-hooks/use-translator";
import { messageEventType } from "../../game-base/handlers";
import { RoundState } from "../../game-base/type";
import styles from "./countdown-timer.module.scss";

export type Rotation = "clockwise" | "counterclockwise";
interface CountdownTimerProps {
    gameId: number;
    SimpleTimerProp?: ({ clientRemainingTime, gameId }: { clientRemainingTime: any; gameId: number }) => JSX.Element;
    GameStatusProp?: ({ children }: { children: any }) => JSX.Element;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ gameId, SimpleTimerProp = SimpleTimer, GameStatusProp = GameStatus }) => {
    const { roundState } = useGameStateContext();
    const { t } = useSNTranslate();
    const { gameMessageHandler } = useGameContext();
    const [clientRemainingTime, setClientRemainingTime] = useState(0);

    useEffect(() => {
        const handlerId = gameMessageHandler?.register(messageEventType.CLIENT_REMAINING_TIME, ({ clientRemainingTime }) => {
            setClientRemainingTime(clientRemainingTime);
        });

        return () => {
            gameMessageHandler?.removeHandler(handlerId);
        };
    }, []);

    switch (roundState) {
        case RoundState.InRound:
            return (
                <>
                    <SimpleTimerProp clientRemainingTime={clientRemainingTime} gameId={gameId} />
                    <GameStatus>
                        <div className={styles["start-betting"]}>{t("status_start_bet")}</div>
                    </GameStatus>
                </>
            );
        case RoundState.LockingBet:
            return (
                <>
                    <SimpleTimerProp clientRemainingTime={clientRemainingTime} gameId={gameId} />
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

export const SimpleTimer = ({ clientRemainingTime, gameId }) => {
    const { roundState } = useGameStateContext();
    const [timeLeft, setTimeLeft] = useState(clientRemainingTime);
    const playBlockBetSound = useBlockBetSound();
    const gameSettings = getGameSettings(gameId);
    useEffect(() => {
        if (clientRemainingTime !== timeLeft) {
            setTimeLeft(clientRemainingTime);
        }

        if (clientRemainingTime > 0 && clientRemainingTime <= gameSettings?.durations?.lockingBet) {
            playBlockBetSound();
        }
    }, [clientRemainingTime, timeLeft]);

    return timeLeft <= 0 ? (
        <></>
    ) : (
        <div className={styles.timer}>
            <div className={`${styles["countdown-timer"]} ${roundState !== RoundState.InRound ? styles["lock-bet"] : ""}`}>
                <div className={styles["countdown-timer-background"]} />
                <span className={styles["countdown-timer-number"]}>{(timeLeft % 60).toString().padStart(2, "0")}</span>
            </div>
        </div>
    );
};

export const GameStatus = ({ children }) => {
    const { turnCounter } = useGameStateContext();
    const { t } = useSNTranslate();

    if (turnCounter <= 0) {
        return <></>;
    }

    return (
        <div className={`${styles["game-status"]}`}>
            <span>{t(`draw_${turnCounter}`)}</span>
            {children}
        </div>
    );
};

export default CountdownTimer;
