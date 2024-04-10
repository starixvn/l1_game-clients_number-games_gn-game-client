import { useEffect, useState } from "react";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { GameSettings, RoundState } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";

type Props = {
    transmitter: LobbyGameTransmitter;
    gameSettings: GameSettings;
};

const messageEventTypes = {
    REMAINING_TIME: "remainingTime",
    START_PLACE_BET: "spb",
    FINISH: "finish",
};

export const CountdownTimer: React.FC<Props> = ({ transmitter, gameSettings }) => {
    const [timeCounter, setTimeCounter] = useState<number>(null);
    const [roundState, setRoundState] = useState<RoundState>(RoundState.None);
    const { t } = useTranslator();

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(messageEventTypes.REMAINING_TIME, handleRemainingTime));
            listenerIds.push(transmitter.register(messageEventTypes.START_PLACE_BET, handleStartPlacingBet));
            listenerIds.push(transmitter.register(messageEventTypes.FINISH, handleDisplayResult));
        }
        return () => {
            listenerIds.forEach((listenerId) => transmitter?.unsubscribe(listenerId));
        };
    }, [transmitter]);

    const handleDisplayResult = () => {
        setRoundState(RoundState.DisplayResult);
    };

    const handleStartPlacingBet = () => {
        const { durations } = gameSettings;
        setTimeCounter(durations.placingBets + 1);
    };

    const getRemainingTime = (remainingTime: number) => {
        const { durations } = gameSettings;
        const { wholeTurn } = durations;
        const totalTurns = gameSettings.totalTurns;
        if (remainingTime >= wholeTurn * totalTurns) {
            return (remainingTime % wholeTurn) + wholeTurn;
        }
        return remainingTime % wholeTurn;
    };

    const handleRemainingTime = ({ remainingTime }) => {
        const { durations } = gameSettings;
        setTimeCounter(durations.wholeTurn ? getRemainingTime(remainingTime) : remainingTime);
    };

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setTimeCounter((prevTimeCounter) => {
                return prevTimeCounter > 0 ? prevTimeCounter - 1 : prevTimeCounter;
            });
        }, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        if (timeCounter === null) {
            return;
        }
        const { durations } = gameSettings;
        if (timeCounter > durations.placingBets || timeCounter <= 0) {
            setRoundState(RoundState.DisplayResult);
            return;
        }
        if (timeCounter > durations.lockingBet) {
            setRoundState(RoundState.InRound);
            return;
        }
        if (timeCounter > 0) {
            setRoundState(RoundState.LockingBet);
        }
    }, [timeCounter]);

    if (timeCounter === null) {
        return null;
    }

    const className = Styles["countdown-timer"];
    switch (roundState) {
        case RoundState.InRound:
            return (
                <div className={className}>
                    <span className="icon-clock" />
                    <span className={Styles["countdown-timer-value"]}>{timeCounter.toString().padStart(2, "0")}</span>
                </div>
            );
        case RoundState.LockingBet:
            return (
                <div className={`${className} ${Styles["block-bet"]}`}>
                    <span className="icon-clock" />
                    <span className={Styles["countdown-timer-value"]}>{timeCounter.toString().padStart(2, "0")}</span>
                </div>
            );
        case RoundState.DisplayResult:
            return <div className={`${className} ${Styles["show-result"]}`}>{t("status_result")}</div>;
        default:
            return <div className={className}></div>;
    }
};

export default CountdownTimer;
