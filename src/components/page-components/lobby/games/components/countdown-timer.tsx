import { useEffect, useState } from "react";
import Styles from "../../lobby.module.scss";
import { LobbyGameTransmitter } from "./game-board";
import { GameSettings, RoundState } from "../../../../game-base/type";
import { useTranslator } from "../../../../../_shared/react-hooks";

type Props = {
    lobbyGameTransmitter: LobbyGameTransmitter;
    gameSettings: GameSettings;
};

const messageEventTypes = {
    REMAINING_TIME: "remainingTime",
    START_PLACE_BET: "spb",
    FINISH: "finish",
};

export const CountdownTimer: React.FC<Props> = ({ lobbyGameTransmitter, gameSettings }) => {
    const [timeCounter, setTimeCounter] = useState<number>(null);
    const [roundState, setRoundState] = useState<RoundState>(RoundState.None);
    const { t } = useTranslator();

    useEffect(() => {
        lobbyGameTransmitter && registerTimerEvents();
    }, [lobbyGameTransmitter]);

    const registerTimerEvents = () => {
        lobbyGameTransmitter.register(messageEventTypes.REMAINING_TIME, handleRemainingTime);
        lobbyGameTransmitter.register(messageEventTypes.START_PLACE_BET, handleStartPlacingBet);
        lobbyGameTransmitter.register(messageEventTypes.FINISH, handleDisplayResult);
    };

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

    switch (roundState) {
        case RoundState.InRound:
            return (
                <div className={Styles["countdown-timer"]}>
                    <span className="icon-clock" />
                    {timeCounter}
                </div>
            );
        case RoundState.LockingBet:
            return (
                <div className={`${Styles["countdown-timer"]} ${Styles["block-bet"]}`}>
                    <span className="icon-clock" />
                    {timeCounter}
                </div>
            );
        case RoundState.DisplayResult:
            return <div className={`${Styles["countdown-timer"]} ${Styles["show-result"]}`}>{t("status_result")}</div>;
        default:
            return <div className={Styles["countdown-timer"]}></div>;
    }
};
