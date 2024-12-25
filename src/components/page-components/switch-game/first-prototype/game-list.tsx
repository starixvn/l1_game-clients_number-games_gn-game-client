import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import GameListItem, { Game } from './game-list-item';
import styles from './styles/game-list.module.scss';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import GameSelection from '../game-selection';

interface GameGroup {
    name: string;
    games: Game[];
}

interface GameListProps {
    gameGroups: GameGroup[];
    onClose?: () => void;
}

const STORAGE_KEYS = {
    RECENT_GAMES: 'switch-game-recent-games',
    SELECTED_TAB: 'switch-game-selected-tab'
};

const GameList: React.FC<GameListProps> = ({ gameGroups, onClose }) => {
    const [selectedTab, setSelectedTab] = useState(() => {
        const savedTab = localStorage.getItem(STORAGE_KEYS.SELECTED_TAB);
        return savedTab ? parseInt(savedTab, 10) : 0;
    });

    const [recentGames, setRecentGames] = useState<Game[]>(() => {
        const savedGames = localStorage.getItem(STORAGE_KEYS.RECENT_GAMES);
        return savedGames ? JSON.parse(savedGames) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.RECENT_GAMES, JSON.stringify(recentGames));
    }, [recentGames]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SELECTED_TAB, selectedTab.toString());
    }, [selectedTab]);

    const handleGameSelect = (game: Game) => {
        setRecentGames(prevGames => {
            const filteredGames = prevGames.filter(g => g.id !== game.id);
            const newGames = [game, ...filteredGames];
            return newGames.slice(0, 5);
        });
    };

    const allTabs = ['Recent Games', ...gameGroups.map(group => group.name)];

    return (
        <div className={styles.gameListContainer}>
            <div className={styles.stickyHeader}>
                <div className={styles.header}>
                    <h2>Game Selection</h2>
                    {onClose && (
                        <button className={styles.closeButton} onClick={onClose}>
                            ×
                        </button>
                    )}
                </div>

                <div className={styles.tabsContainer}>
                    <Swiper
                        modules={[FreeMode]}
                        slidesPerView="auto"
                        freeMode={true}
                        className={styles.tabList}
                    >
                        {allTabs.map((tabName, index) => (
                            <SwiperSlide key={tabName} className={styles.tabSlide}>
                                <button
                                    className={`${styles.tab} ${selectedTab === index ? styles.selectedTab : ''}`}
                                    onClick={() => setSelectedTab(index)}
                                >
                                    {tabName}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            <div className={styles.contentContainer}>
                {selectedTab === 0 ? (
                    <div className={styles.tabPanel}>
                        {recentGames.length > 0 ? (
                            recentGames.map((game) => (
                                <GameListItem
                                    key={game.id}
                                    game={game}
                                    onSelect={handleGameSelect}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                No recent games. Select a game to get started!
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.tabPanel}>
                        {gameGroups[selectedTab - 1].games.map((game) => (
                            <GameListItem
                                key={game.id}
                                game={game}
                                onSelect={handleGameSelect}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameList;
