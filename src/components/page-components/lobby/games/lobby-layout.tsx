import { useMemo } from "react";
import { Socket } from "socket.io-client";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getLobbyGameIds, getOfferGamesIds } from "../../../../_shared/helpers";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { ILobbyConfigs } from "../../dashboard/type";
import { GameBoard } from "./components/game-board";

type Props = {
    openGame: Function;
    socket: Socket;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: any;
};
export const LobbyLayout: React.FC<Props> = ({ socket, lobbyConfigs, openGame, gameTransmitters }) => {
    const { authorizeInfo } = usePlayerContext();

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
        socket &&
        gamesSettings && (
            <>
                {gamesSettings.map((gameSettings) => (
                    <GameBoard
                        key={`game-board-${gameSettings.gameName}`}
                        gameSettings={gameSettings}
                        socket={socket}
                        openGame={openGame}
                        gameTransmitter={gameTransmitters[gameSettings.id]}
                    />
                ))}
            </>
        )
    );
};
