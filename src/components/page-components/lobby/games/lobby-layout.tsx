import { useMemo } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getLobbyGameIds, getOfferGamesIds } from "../../../../_shared/helpers";
import { useLobbyConnectionContext, usePlayerContext } from "../../../../_shared/react-contexts";
import { ILobbyConfigs } from "../../dashboard/type";
import { GameBoard } from "./components/game-board";

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
            return lobbyGameIds?.map((gameId) => allGamesSettings[gameId]).filter((settings) => settings);
        }
        return [];
    }, [lobbyConfigs, authorizeInfo]);

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
            </>
        )
    );
};
