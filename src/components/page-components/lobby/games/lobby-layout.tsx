import { useMemo } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getLobbyGameIds, getOfferGamesIds } from "../../../../_shared/helpers";
import { useLobbyConnectionContext, usePlayerContext } from "../../../../_shared/react-contexts";
import { ILobbyConfigs } from "../../dashboard/type";
import { GameBoard } from "./components/game-board";
import { ComingSoonGameBoard } from "./components/coming-soon-game-board";

type Props = {
    openGame: Function;
    lobbyConfigs: ILobbyConfigs;
};
export const LobbyLayout: React.FC<Props> = ({ lobbyConfigs, openGame }) => {
    const { authorizeInfo } = usePlayerContext();
    const { gameTransmitters } = useLobbyConnectionContext();

    const gamesSettings = useMemo(() => {
        const offerGamesIds = getOfferGamesIds(authorizeInfo);
        if (lobbyConfigs && offerGamesIds) {
            const { gameSettings: allGamesSettings } = getAppSettings();
            const lobbyGameIds = getLobbyGameIds(lobbyConfigs)?.filter((gameId) => offerGamesIds.includes(gameId));
            return lobbyGameIds?.map((gameId) => allGamesSettings[gameId]).filter((settings) => settings && !settings.isComingSoon);
        }
        return [];
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
        gamesSettings && (
            <>
                {gamesSettings.map((gameSettings) => (
                    <GameBoard
                        key={`game-board-${gameSettings.gameName}`}
                        gameSettings={gameSettings}
                        openGame={openGame}
                        gameTransmitter={gameTransmitters[gameSettings.id]}
                    />
                ))}
                {comingSoonGameSettings.map((gameSettings) => (
                    <ComingSoonGameBoard gameSettings={gameSettings} key={`coming-soon-${gameSettings.gameName}`} />
                ))}
            </>
        )
    );
};
