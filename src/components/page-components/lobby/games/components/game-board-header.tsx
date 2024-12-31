import { LoadingSpinner } from "../../../../game-components/game-loading/loading-spinner";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import styles from "./game-board.module.scss";
import { useTranslator } from "../../../../../_shared/react-hooks";
import CountdownTimer from "./countdown-timer";

type GameBoardHeaderProps = {
    gameSettings: GameSettings;
    isLoading: boolean;
    isShow: boolean;
    transmitter: LobbyGameTransmitter;
};

export const GameBoardHeader: React.FC<GameBoardHeaderProps> = ({
    gameSettings,
    isLoading,
    isShow,
    transmitter
}) => {
    const { t } = useTranslator([gameSettings.tolgeeNamespace]);

    return (
        <div className={styles.gameHeader}>
            <div className={styles.gameInfo}>
                <h2>{t(`${gameSettings.tolgeeNamespace}.game_name_${gameSettings.id}`).toUpperCase()}</h2>
            </div>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                isShow && (
                    <div className={styles.timerContainer}>
                        <CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />
                    </div>
                )
            )}
        </div>
    );
}; 