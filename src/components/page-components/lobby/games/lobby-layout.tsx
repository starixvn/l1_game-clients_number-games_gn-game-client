import { useMemo, useState } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { getOfferGamesIds, getRenderGameSettings } from "../../../../_shared/helpers";
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

    // Log props for monitoring
    console.log('LobbyLayout Props:', {
        lobbyConfigs,
        openGame: typeof openGame,
        gameTransmittersCount: Object.keys(gameTransmitters).length
    });

    const offerGamesIds = getOfferGamesIds(authorizeInfo);
    console.log('Offer Games IDs:', {
        count: offerGamesIds?.length || 0,
        ids: offerGamesIds,
        authorizeInfo: {
            hasAuthorizeInfo: !!authorizeInfo,
        }
    });

    const gamesSettings = getRenderGameSettings(lobbyConfigs, offerGamesIds);
    console.log('Rendered Game Settings:', {
        count: gamesSettings?.length || 0,
        categories: lobbyConfigs?.categories?.map(c => c.name),
        filteredGames: gamesSettings?.map(g => ({
            id: g.id,
            name: g.gameName,
        }))
    });

    const comingSoonGameSettings = useMemo(() => {
        const { gameSettings: allGamesSettings } = getAppSettings();
        if (allGamesSettings) {
            const { gameSettings: allGamesSettings } = getAppSettings();
            return Object.values(allGamesSettings).filter((gameSetting) => gameSetting.isComingSoon);
        }
        return [];
    }, []);
    // Log additional details for monitoring
    console.log('LobbyLayout Game Settings:', {
        totalGames: gamesSettings?.length || 0,
        comingSoonGames: comingSoonGameSettings?.length || 0,
        gameIds: gamesSettings?.map(g => g.id),
        gameNames: gamesSettings?.map(g => g.gameName)
    });



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
