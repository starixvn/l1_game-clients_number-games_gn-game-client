import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { LobbyLayout } from '../lobby/games/lobby-layout';
import { Banner } from '../lobby/banners/banner';
import { ILobbyConfigs } from '../dashboard/type';
import { LobbyGameTransmitter } from '../lobby/lobby-socket-connection';
import { LobbyConnectionContextProvider } from '../../../_shared/react-contexts';
import styles from './styles/game-selection.module.scss';
import { GameSettings } from "../../../components/game-base/type";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import { getAppSettings } from '../../../_shared/app-settings';

interface GameGroup {
    name: string;
    games: any[]; // Replace with proper game type
}

interface LobbyTabProps {
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
    console.log('Input lobbyConfigs:', lobbyConfigs);
    console.log('Selected category:', selectedCategory);

    // Create game groups from game settings
    const gameSettings = getAppSettings().gameSettings;
    console.log('Game settings from app config:', gameSettings);

    const gameGroups = Object.values(gameSettings).reduce<GameGroup[]>((groups, game) => {
        console.log('Processing game:', game);
        const existingGroup = groups.find(g => g.name === game.gameGroup);
        if (existingGroup) {
            console.log('Adding game to existing group:', game.gameGroup);
            existingGroup.games.push({ id: game.id });
        } else {
            console.log('Creating new group:', game.gameGroup);
            groups.push({
                name: game.gameGroup,
                games: [{ id: game.id }]
            });
        }
        console.log('Current groups:', groups);
        return groups;
    }, []);

    console.log('Generated game groups:', gameGroups);

    // Get the selected game group
    const selectedGroup = gameGroups[selectedCategory];
    console.log('Selected game group:', selectedGroup);

    const filteredConfigs = {
        ...lobbyConfigs,
        categories: lobbyConfigs.categories.map(category => ({
            ...category,
            gameSettings: category.gameSettings.filter(game =>
                selectedGroup?.games.some(g => g.id === game.gameId)
            )
        }))
    };

    console.log('Filtered lobby configs:', filteredConfigs);
    return filteredConfigs;
};

const LobbyTab: React.FC<LobbyTabProps> = ({
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

    const categories = gameGroups.map(group => group.name);

    return (
        <LobbyConnectionContextProvider value={lobbyConnectionContextValue}>
            <div className={styles.lobbyContent}>
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
                        initialSlide={selectedCategory}
                    >
                        {categories.map((category, index) => (
                            <SwiperSlide
                                key={category}
                                className={styles.tabSlide}
                                style={{ width: 'auto' }}
                            >
                                <button
                                    className={`${styles.tab} ${selectedCategory === index ? styles.active : ''}`}
                                    onClick={() => handleCategoryClick(index)}
                                >
                                    {category}
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

export default LobbyTab; 