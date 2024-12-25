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
    onClose?: () => void;
    onGameSelect?: (game: Game) => void;
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
    lobbyConnectionContextValue: any;
}

const STORAGE_KEYS = {
    RECENT_GAMES: 'switch-game-recent-games',
    SELECTED_TAB: 'switch-game-selected-tab'
};

const GameSelection: React.FC<GameSelectionProps> = ({
    gameGroups,
    onClose,
    onGameSelect,
    lobbyConfigs,
    gameTransmitters,
    openGame,
    lobbyConnectionContextValue
}) => {
    const [selectedTab, setSelectedTab] = useState(() => {
        const savedTab = localStorage.getItem(STORAGE_KEYS.SELECTED_TAB);
        return savedTab ? parseInt(savedTab, 10) : 0;
    });

    const [recentGames, setRecentGames] = useState<Game[]>(() => {
        const savedGames = localStorage.getItem(STORAGE_KEYS.RECENT_GAMES);
        return savedGames ? JSON.parse(savedGames) : [];
    });

    const [swiperInstance, setSwiperInstance] = useState<any>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const headerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.RECENT_GAMES, JSON.stringify(recentGames));
    }, [recentGames]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SELECTED_TAB, selectedTab.toString());
    }, [selectedTab]);

    useEffect(() => {
        // Find the header element and get its height
        const header = document.querySelector('[data-testid="header"]');
        if (header) {
            headerRef.current = header as HTMLElement;
            setHeaderHeight(header.getBoundingClientRect().height);
        }

        // Update height on window resize
        const handleResize = () => {
            if (headerRef.current) {
                setHeaderHeight(headerRef.current.getBoundingClientRect().height);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleGameSelect = (game: Game) => {
        const updatedGames = (() => {
            const filteredGames = recentGames.filter(g => g.id !== game.id);
            return [game, ...filteredGames].slice(0, 5);
        })();

        // Update localStorage first
        localStorage.setItem(STORAGE_KEYS.RECENT_GAMES, JSON.stringify(updatedGames));

        // Then update state and call onGameSelect
        setRecentGames(updatedGames);
        onGameSelect?.(game);
    };

    const allTabs = ['Lobby', 'Recent Games', ...gameGroups.map(group => group.name)];

    const handleTabClick = (index: number) => {
        setSelectedTab(index);

        if (swiperInstance) {
            // Calculate the target slide position
            const slide = swiperInstance.slides[index];
            if (slide) {
                // Get the container width and slide position
                const containerWidth = swiperInstance.width;
                const slideLeft = slide.offsetLeft;
                const slideWidth = slide.offsetWidth;

                // Calculate the target position that will center the slide
                const targetPosition = -(slideLeft - (containerWidth / 2) + (slideWidth / 2));

                // Clamp the position to prevent over-scrolling
                const maxPosition = 0;
                const minPosition = -swiperInstance.virtualSize + containerWidth;
                const clampedPosition = Math.min(maxPosition, Math.max(minPosition, targetPosition));

                // Animate to the target position
                swiperInstance.setTransition(300); // 300ms animation
                swiperInstance.setTranslate(clampedPosition);
            }
        }
    };

    return (
        <>
            <div
                className={styles.overlay}
                onClick={onClose}
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
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">
                        <span className={styles.closeIcon}>×</span>
                    </button>
                </header>

                <div className={styles.tabsContainer}>
                    <Swiper
                        modules={[FreeMode]}
                        slidesPerView="auto"
                        freeMode={{
                            enabled: true,
                            sticky: true,
                            momentumRatio: 0.5,
                            momentumVelocityRatio: 0.5,
                        }}
                        speed={300}
                        spaceBetween={8}
                        grabCursor={true}
                        touchEventsTarget="container"
                        preventClicks={false}
                        preventClicksPropagation={false}
                        className={styles.tabList}
                        onSwiper={setSwiperInstance}
                        centeredSlides={false}
                        initialSlide={selectedTab}
                    >
                        {allTabs.map((tabName, index) => (
                            <SwiperSlide
                                key={tabName}
                                className={styles.tabSlide}
                                style={{ width: 'auto' }}
                            >
                                <button
                                    className={`${styles.tab} ${selectedTab === index ? styles.active : ''}`}
                                    onClick={() => handleTabClick(index)}
                                >
                                    {tabName}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className={styles.gameList}>
                    {selectedTab === 0 ? (
                        <LobbyTab
                            lobbyConfigs={lobbyConfigs}
                            gameTransmitters={gameTransmitters}
                            openGame={openGame}
                            lobbyConnectionContextValue={lobbyConnectionContextValue}
                            gameGroups={gameGroups}
                        />
                    ) : selectedTab === 1 ? (
                        recentGames.length > 0 ? (
                            recentGames.map(game => (
                                <GameItem
                                    key={game.id}
                                    game={game}
                                    onSelect={handleGameSelect}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                No recent games. Select a game to get started!
                            </div>
                        )
                    ) : (
                        gameGroups[selectedTab - 2].games.map(game => (
                            <GameItem
                                key={game.id}
                                game={game}
                                onSelect={handleGameSelect}
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default GameSelection; 