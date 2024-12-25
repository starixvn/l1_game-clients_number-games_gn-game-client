import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import styles from './styles/game-selection.module.scss';
import GameItem from './game-item';
import { LobbyLayout } from '../lobby/games/lobby-layout';
import { Banner } from '../lobby/banners/banner';
import { ILobbyConfigs } from '../dashboard/type';
import { LobbyGameTransmitter } from '../lobby/lobby-socket-connection';
import LobbyTab from './lobby-tab';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

interface Game {
    id: string;
    name: string;
    variant: string;
    betRange: {
        min: number;
        max: number;
    };
    rtp: number;
    roundCount: number;
    background: string;
    results: ('red' | 'blue')[];
}

interface GameGroup {
    name: string;
    games: Game[];
}

interface GameSelectionProps {
    gameGroups: GameGroup[];
    onClose?: (gameId: number) => void;
    onGameSelect?: (game: Game) => void;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
    lobbyConnectionContextValue: any;
    headerRef: React.RefObject<HTMLElement>;
}

const STORAGE_KEYS = {
    RECENT_GAMES: 'switch-game-recent-games',
    SELECTED_TAB: 'switch-game-selected-tab'
};

const GameSelectionLobby: React.FC<GameSelectionProps> = ({
    gameGroups,
    onClose,
    onGameSelect,
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
        console.log("handleClose gameId", gameId)
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
                    <LobbyTab
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

export default GameSelectionLobby; 