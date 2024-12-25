import { useContext, useState } from "react";

import { updateURLContext, URLContext } from "../../../_shared/react-contexts/url-context";
import { useClickSound } from "../../../_shared/react-hooks";
import Styles from "./switch-game.module.scss";
import GameSelection from "./game-selection";
import { mockGames } from './mock-data-test';
import { LobbyConnectionContext } from "../../../_shared/react-contexts";
import { ILobbyConfigs } from '../dashboard/type';
import { LobbyGameTransmitter } from '../lobby/lobby-socket-connection';

// Group the games by name
const gameGroups = Array.from(
    new Set(mockGames.map(game => game.name))
).map(gameName => ({
    name: gameName,
    games: mockGames.filter(game => game.name === gameName)
}));

interface SwitchGameProps {
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
}

const SwitchGame1: React.FC<SwitchGameProps> = ({ lobbyConfigs, gameTransmitters, openGame }) => {
    const clickSound = useClickSound();
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleSwitchGameClick = () => {
        clickSound();
        setIsPopupOpen(true);
    };

    const handleGameSelect = (game: any) => {
        clickSound();
        setIsPopupOpen(false);
        // Add any additional game selection logic here
    };

    const lobbyConnectionContext = useContext(LobbyConnectionContext);

    return (
        <>
            <div className={Styles["switch-game"]} onClick={handleSwitchGameClick}>
                <span id="list-game" className="icon icon-list-game" />
                Games
            </div>
            {isPopupOpen && (
                <GameSelection
                    gameGroups={gameGroups}
                    onClose={() => setIsPopupOpen(false)}
                    onGameSelect={handleGameSelect}
                    lobbyConfigs={lobbyConfigs}
                    gameTransmitters={gameTransmitters}
                    openGame={openGame}
                    lobbyConnectionContextValue={lobbyConnectionContext}
                />
            )}
        </>
    );
};

const SwitchGame = () => {
    const clickSound = useClickSound();
    const { backToRedirectUrl, isDirectMode, redirectUrl } = useContext(URLContext);
    const handleBackToLobbyOnclick = () => {
        clickSound();
        updateURLContext({ gameId: 0 });
        backToRedirectUrl(redirectUrl);
    };

    return (
        <div className={Styles["switch-game"]} onClick={() => handleBackToLobbyOnclick()}>
            <span id="list-game" className="icon icon-list-game" />
            Games
        </div>
    );
};

export default SwitchGame;

