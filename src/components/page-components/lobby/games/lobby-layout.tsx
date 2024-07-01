import { useMemo, useState } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getAvailableGameSettings, getOfferGamesIds } from "../../../../_shared/helpers";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { ILobbyConfigs } from "../../dashboard/type";
import { LobbyGameTransmitter } from "../lobby-socket-connection";
import { ComingSoonGameBoard } from "./components/coming-soon-game-board";
import { GameBoard } from "./components/game-board";

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
};
export const LobbyLayout: React.FC<Props> = ({ lobbyConfigs, openGame, gameTransmitters }) => {
    const { authorizeInfo } = usePlayerContext();
    const [lastClickedGameId, setLastClickedGameId] = useState(null);

    const gamesSettings = useMemo(() => {
        const offerGamesIds = getOfferGamesIds(authorizeInfo);
        return getAvailableGameSettings(lobbyConfigs, offerGamesIds);
    }, [lobbyConfigs, authorizeInfo]);

    const comingSoonGameSettings = useMemo(() => {
        const { gameSettings: allGamesSettings } = getAppSettings();
        if (allGamesSettings) {
            const { gameSettings: allGamesSettings } = getAppSettings();
            return Object.values(allGamesSettings).filter((gameSetting) => gameSetting.isComingSoon);
        }
        return [];
    }, []);

    return (
        gameTransmitters &&
        Object.values(gameTransmitters).length > 0 &&
        gamesSettings && (
            <>
                {gamesSettings.map((gameSettings) => (
                    <GameBoard
                        key={`game-board-${gameSettings.gameName}`}
                        gameSettings={gameSettings}
                        openGame={openGame}
                        gameTransmitter={gameTransmitters[gameSettings.id]}
                        lastClickedGameId={lastClickedGameId}
                        setLastClickedGameId={setLastClickedGameId}
                    />
                ))}
                {comingSoonGameSettings.map((gameSettings) => (
                    <ComingSoonGameBoard gameSettings={gameSettings} key={`coming-soon-${gameSettings.gameName}`} />
                ))}
            </>
        )
    );
};
