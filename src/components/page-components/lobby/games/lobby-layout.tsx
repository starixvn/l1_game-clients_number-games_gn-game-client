import { useMemo } from "react";
import { GameBoard } from "./components/game-board";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getLobbyGameIds, getOfferGamesIds } from "../../../../_shared/helpers";
import { ILobbyConfigs } from "../../dashboard/type";
import { Socket } from "socket.io-client";

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
            return lobbyGameIds.map((gameId) => allGamesSettings[gameId]);
        }
        return [];
    }, [lobbyConfigs, authorizeInfo]);

    return (
        socket &&
        gamesSettings?.map((gameSettings) => (
            <GameBoard
                key={`game-board-${gameSettings.gameName}`}
                gameSettings={gameSettings}
                socket={socket}
                openGame={openGame}
                gameTransmitter={gameTransmitters[gameSettings.id]}
            />
        ))
    );
};
