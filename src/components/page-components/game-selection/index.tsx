import React, { useState, useEffect } from 'react';
import styles from './game-selection.module.scss';
import { ILobbyConfigs } from '../dashboard/type';
import { LobbyGameTransmitter } from '../lobby/lobby-socket-connection';
import GameCategoryNavigator from './game-category-navigator';

interface GameGroup {
    name: string;
    games: Array<{
        id: number;
        gameName: string;
        gameGroup?: string;
        gamePath?: string;
        isComingSoon?: boolean;
        gameResourceConfigs: {
            path: string;
            optionalPaths?: string[];
            cachePaths?: string[];
        };
        betRange?: {
            min: number;
            max: number;
        };
        rtp?: number;
    }>;
}

interface GameSelectionProps {
    gameGroups: GameGroup[];
    onClose?: (gameId: number) => void;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
    lobbyConnectionContextValue: any;
    headerRef: React.RefObject<HTMLElement>;
}

const GameSelection: React.FC<GameSelectionProps> = ({
    gameGroups,
    onClose,
    lobbyConfigs,
    gameTransmitters,
    openGame,
    lobbyConnectionContextValue,
    headerRef
}) => {
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const updateHeaderHeight = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.getBoundingClientRect().height);
            }
        };

        updateHeaderHeight();
        window.addEventListener('resize', updateHeaderHeight);
        return () => window.removeEventListener('resize', updateHeaderHeight);
    }, [headerRef]);

    const handleClose = () => {
        const gameId = headerRef.current?.getAttribute('data-game-id');
        onClose?.(gameId ? Number(gameId) : 0);
    };

    return (
        <>
            <div
                className={styles.overlay}
                style={{ top: `${headerHeight}px` }}
            />
            <div
                className={`${styles.container} game-container`}
                style={{
                    top: `${headerHeight}px`,
                    height: `calc(100vh - ${headerHeight}px)`
                }}
            >
                <header className={styles.header}>
                    <h1>GAME SELECTION</h1>
                    <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
                        <span className={styles.closeIcon}>×</span>
                    </button>
                </header>

                <div className={styles.gameList}>
                    <GameCategoryNavigator
                        lobbyConfigs={lobbyConfigs}
                        gameTransmitters={gameTransmitters}
                        openGame={openGame}
                        lobbyConnectionContextValue={lobbyConnectionContextValue}
                        gameGroups={gameGroups}
                    />
                </div>
            </div>
        </>
    );
};

export default GameSelection;