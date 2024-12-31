import { useMemo, useState } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getOfferGamesIds, getRenderGameSettings } from "../../../../_shared/helpers";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { ILobbyConfigs } from "../../dashboard/type";
import { LobbyGameTransmitter } from "../lobby-socket-connection";
import { ComingSoonGameBoard } from "./components/coming-soon-game-board";
import { GameBoard } from "./components/game-board";
import styles from "./lobby-layout.module.scss";

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
};

export const LobbyLayout: React.FC<Props> = ({ lobbyConfigs, openGame, gameTransmitters }) => {
    const { authorizeInfo } = usePlayerContext();
    const [lastClickedGameId, setLastClickedGameId] = useState(null);

    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    const gamesSettings = getRenderGameSettings(lobbyConfigs, offerGamesIds);

    const comingSoonGameSettings = useMemo(() => {
        const { gameSettings: allGamesSettings } = getAppSettings();
        if (allGamesSettings) {
            return Object.values(allGamesSettings).filter((gameSetting) => gameSetting.isComingSoon);
        }
        return [];
    }, []);

    return (
        gameTransmitters &&
        Object.values(gameTransmitters).length > 0 &&
        gamesSettings && (
            <div >
                <div className={styles.gamesGrid}>
                    {gamesSettings.map((gameSettings, index) => (
                        <div key={`game-board-${gameSettings.gameName}`} className={styles.gameItem}>
                            <GameBoard
                                gameSettings={gameSettings}
                                openGame={openGame}
                                gameTransmitter={gameTransmitters[gameSettings.id]}
                                lastClickedGameId={lastClickedGameId}
                                setLastClickedGameId={setLastClickedGameId}
                                gameIndex={index}
                            />
                        </div>
                    ))}
                </div>
                {comingSoonGameSettings.length > 0 && (
                    <div className={styles.comingSoonGrid}>
                        {comingSoonGameSettings.map((gameSettings) => (
                            <div key={`coming-soon-${gameSettings.gameName}`} className={styles.gameItem}>
                                <ComingSoonGameBoard gameSettings={gameSettings} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    );
};
