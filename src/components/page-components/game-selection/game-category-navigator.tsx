import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { LobbyLayout } from '../lobby/games/lobby-layout';
import { ILobbyConfigs } from '../dashboard/type';
import { LobbyGameTransmitter } from '../lobby/lobby-socket-connection';
import { LobbyConnectionContextProvider } from '../../../_shared/react-contexts';
import styles from './game-selection.module.scss';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import { getAppSettings } from '../../../_shared/app-settings';
import { ActiveTabIndicator } from './active-tab-indicator';

interface GameGroup {
    name: string;
    games: any[];
}

interface GameSelectionTabProps {
    lobbyConfigs: ILobbyConfigs;
    gameTransmitters: Record<number, LobbyGameTransmitter>;
    openGame: Function;
    lobbyConnectionContextValue: any;
    gameGroups: GameGroup[];
}

const STORAGE_KEY = 'lobby-tab-selected-category';
export const buildFilteredLobbyConfigs = (
    lobbyConfigs: ILobbyConfigs,
    selectedCategory: number
): ILobbyConfigs => {
    if (selectedCategory === 0) {
        return lobbyConfigs;
    }

    const adjustedCategoryIndex = selectedCategory - 1;

    const gameSettings = getAppSettings().gameSettings;
    const gameGroups = Object.values(gameSettings).reduce<GameGroup[]>((groups, game) => {
        const existingGroup = groups.find(g => g.name === game.gameGroup);
        if (existingGroup) {
            existingGroup.games.push({ id: game.id });
        } else {
            groups.push({
                name: game.gameGroup,
                games: [{ id: game.id }]
            });
        }
        return groups;
    }, []);

    const selectedGroup = gameGroups[adjustedCategoryIndex];

    const filteredConfigs = {
        ...lobbyConfigs,
        categories: lobbyConfigs.categories.map(category => ({
            ...category,
            gameSettings: category.gameSettings.filter(game =>
                selectedGroup?.games.some(g => g.id === game.gameId)
            )
        }))
    };

    return filteredConfigs;
};

const GameCategoryNavigator: React.FC<GameSelectionTabProps> = ({
    lobbyConfigs,
    gameTransmitters,
    openGame,
    lobbyConnectionContextValue,
    gameGroups
}) => {
    const [selectedCategory, setSelectedCategory] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 0;
    });
    const [swiperInstance, setSwiperInstance] = useState<any>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, selectedCategory.toString());
    }, [selectedCategory]);

    const handleOpenGame = (gameId: number) => {
        window.scrollTo(0, 0);
        openGame(gameId);
    };

    const handleCategoryClick = (index: number) => {
        setSelectedCategory(index);

        if (swiperInstance) {
            const slide = swiperInstance.slides[index];
            if (slide) {
                const containerWidth = swiperInstance.width;
                const slideLeft = slide.offsetLeft;
                const slideWidth = slide.offsetWidth;
                const targetPosition = -(slideLeft - (containerWidth / 2) + (slideWidth / 2));
                const maxPosition = 0;
                const minPosition = -swiperInstance.virtualSize + containerWidth;
                const clampedPosition = Math.min(maxPosition, Math.max(minPosition, targetPosition));

                swiperInstance.setTransition(300);
                swiperInstance.setTranslate(clampedPosition);
            }
        }
    };

    const categories = ["All Games", ...gameGroups.map(group => group.name)];

    return (
        <LobbyConnectionContextProvider value={lobbyConnectionContextValue}>
            <div className={styles.lobbyContent}>
                <div className={styles.tabsContainer}>
                    <Swiper
                        modules={[FreeMode]}
                        slidesPerView="auto"
                        freeMode={{
                            enabled: true,
                            sticky: false,
                            momentumRatio: 0.25,
                            momentumVelocityRatio: 0.25,
                        }}
                        speed={300}
                        spaceBetween={4}
                        grabCursor={true}
                        touchEventsTarget="container"
                        preventClicks={false}
                        preventClicksPropagation={false}
                        className={styles.tabList}
                        onSwiper={setSwiperInstance}
                        centeredSlides={false}
                        initialSlide={selectedCategory}
                        watchOverflow={true}
                        observer={true}
                        observeParents={true}
                    >
                        {categories.map((category, index) => (
                            <SwiperSlide
                                key={category}
                                className={styles.tabSlide}
                                style={{
                                    width: 'auto',
                                    marginRight: index === categories.length - 1 ? '0' : undefined
                                }}
                            >
                                <button
                                    className={`${styles.tab} ${selectedCategory === index ? styles.active : ''}`}
                                    onClick={() => handleCategoryClick(index)}
                                >
                                    {selectedCategory === index ? (
                                        <ActiveTabIndicator title={category} />
                                    ) : (
                                        <span>{category}</span>
                                    )}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                <div className={styles.gameList}>
                    <LobbyLayout
                        lobbyConfigs={buildFilteredLobbyConfigs(
                            lobbyConfigs,
                            selectedCategory
                        )}
                        openGame={handleOpenGame}
                        gameTransmitters={gameTransmitters}
                    />
                </div>
            </div>
        </LobbyConnectionContextProvider>
    );
};

export default GameCategoryNavigator;