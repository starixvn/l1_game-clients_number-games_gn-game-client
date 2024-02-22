import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import useSound from "use-sound";
import { getAppSettings } from "../_shared/app-settings";
import { StorageHelper, localStorageKeys } from "../_shared/helpers/storage-helper";
import { SystemContextProvider } from "../_shared/react-contexts";
import { SocketState } from "../_shared/helpers";
import {
    GameCategoryConfig,
    GameCategoryKeys,
    GameCategoryType,
    GamesInOnePage,
    favoriteGameIdIgnore,
} from "../components/page-components/game-category/constants";
import { WinningStreak } from "../components/page-components/winning-streak";
import { WinningStreakItem } from "../components/page-components/winning-streak/winning-streak.type";
import styles from "./games.module.scss";
import { Props } from "./type";
import { AppTypes, GameIds } from "../_shared/constants";
import BacBall from "./bac-ball";
import { GameCategory } from "../components/page-components/game-category";
import { ViewMode } from "../components/game-base/type";
import HappyFour from "./happy-four/page";
import HappyWheel from "./happy-wheel/page";
import SicBalls from "./sic-balls/page";
import NextBall from "./next-ball/page";
import LuckyThree from "./lucky-three/page";

let gamesOrder = [];
const getRenderGames = (selectedCategory: GameCategoryType, selectedPage: number, favoriteGames: number[], userOfferGames: number[]) => {
    if (selectedCategory === GameCategoryType.newNumberGames) {
        return GameCategoryConfig[AppTypes.mobile].newNumberGames;
    }

    if (selectedCategory === GameCategoryType.game) {
        return GameCategoryConfig[AppTypes.mobile].game;
    }
    const tabGames = GameCategoryConfig[getAppSettings().appType][GameCategoryType[selectedCategory]];

    gamesOrder = getAppSettings().offeredGames.filter((gameId) => !favoriteGames.includes(gameId) && tabGames.includes(gameId));

    const startIndex = gamesOrder.length > (selectedPage - 1) * GamesInOnePage ? (selectedPage - 1) * GamesInOnePage : 0;

    return gamesOrder.filter((game) => userOfferGames.includes(game)).slice(startIndex, startIndex + GamesInOnePage);
};

const getCategoryByGameId = (gameId: number) => {
    return (
        GameCategoryKeys.find(
            (category) =>
                GameCategoryConfig[getAppSettings().appType][category] &&
                GameCategoryConfig[getAppSettings().appType][category].includes(gameId)
        ) ?? getDefaultCategory()
    );
};

const getDefaultCategory = () => {
    return "game";
};

const getCategoryByQueryGameId = (gameId: number) => {
    return (
        GameCategoryKeys.find(
            (category) =>
                category !== "game" &&
                GameCategoryConfig[getAppSettings().appType][category] &&
                GameCategoryConfig[getAppSettings().appType][category].includes(gameId)
        ) ?? getDefaultCategory()
    );
};

const getCategoryHashTag = (category: string, pageIndex: number) => {
    return pageIndex > 1 ? `${category}_${pageIndex - 1}` : category;
};

const getUpdatedFavoriteList = (gameId: number, isFavorite: boolean) => {
    const favorites = StorageHelper.get<number[]>(localStorageKeys.favoriteGames) ?? [];
    const newFavoriteList = [...favorites];
    const gameIndex = newFavoriteList.indexOf(gameId);

    gameIndex >= 0 && newFavoriteList.splice(gameIndex, 1);

    isFavorite && newFavoriteList.push(gameId);

    return newFavoriteList;
};

export const Games: React.FC<Props> = ({
    enabledQuickBet,
    betValue,
    enabledWinningStreakNotification,
    enabledPlaySound,
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    updateFavoriteGames,
    favoriteGames,
    queryGame,
    userOfferGames,
    isShowSlidingChip,
    isJoinGame,
    updateQueryGames,
    openGameId,
    openGameName,
    fractionalOddsFormat,
}) => {
    const [playPlaceBetSound] = useSound("./static/sounds/place-bet.mp3");
    const urlHashtag = window.location.hash.replace("#", "").split("_");
    const queryCategory = isJoinGame ? getCategoryByQueryGameId(queryGame) : urlHashtag[0] || getCategoryByGameId(queryGame);
    const [selectedCategory, setSelectedCategory] = useState<GameCategoryType>(GameCategoryType[queryCategory]);
    const [selectedPage, setSelectedPage] = useState(+urlHashtag[1] + 1 || 1);
    const winningStreakRef = useRef(null);
    const { theme } = useTheme();
    location.hash = `#${getCategoryHashTag(queryCategory, selectedPage)}`;
    const [socketState, setSocketState] = useState<SocketState>(SocketState.None);
    const [isJoinedGame, setIsJoinedGame] = useState(false);

    const setFavorite = (gameId: number, isFavorite: boolean) => {
        const newFavoriteList = getUpdatedFavoriteList(gameId, isFavorite);

        updateFavoriteGames(newFavoriteList);
    };

    const renderListGames = () => {
        const renderGames = getRenderGames(
            selectedCategory,
            selectedPage,
            favoriteGames.filter((game) => !favoriteGameIdIgnore.includes(game)),
            userOfferGames
        );

        return renderGames.map((gameId, index) => getGameComponentById(gameId, index));
    };

    const getGameComponentById = (gameId: number, index: number) => {
        const { gameSettings } = getAppSettings();
        let viewMode = isMobileOnly && index !== 0 ? ViewMode.collapse : ViewMode.full;
        if (openGameId && isMobileOnly) {
            viewMode = gameId === openGameId ? ViewMode.full : ViewMode.collapse;
        }

        const gameProps = {
            ...gameSettings[gameId],
            viewMode,
            notifyWinStreak: (winningStreak: WinningStreakItem) =>
                enabledWinningStreakNotification && winningStreakRef?.current && winningStreakRef.current.addWinningStreak(winningStreak),
            playPlaceBetSound: () => enabledPlaySound && playPlaceBetSound(),
            setApiErrorMessage: setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
            finishJoinGame: () => setIsJoinedGame(true),
            isJoinedGame: isJoinedGame,
        };

        switch (gameId) {
            case GameIds.BacBall:
                return <BacBall key={`game-${gameId}`} {...gameProps} />;
            case GameIds.HappyFour:
                return <HappyFour key={`game-${gameId}`} />;
            case GameIds.HappyWheel:
                return <HappyWheel key={`game-${gameId}`} />;
            case GameIds.LuckyThree:
                return <LuckyThree key={`game-${gameId}`} />;
            case GameIds.NextBall:
                return <NextBall key={`game-${gameId}`} />;
            case GameIds.SicBalls:
                return <SicBalls key={`game-${gameId}`} />;

            default:
                return null;
        }
    };

    const selectCategoryPage = (category: string, pageIndex: number, isClearOpenGame = false) => {
        updateQueryGames(NaN, false, isClearOpenGame);
        setSelectedCategory(GameCategoryType[category]);
        setSelectedPage(pageIndex);
        history.pushState(null, "", `#${getCategoryHashTag(category, pageIndex)}`);
    };

    useEffect(() => {
        setIsJoinedGame(false);
    }, [openGameId, isJoinGame]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        selectCategoryPage(queryCategory, 1);
    }, [queryGame]);

    return (
        <div className={`game-container game-wrapper ${isShowSlidingChip ? styles["open-chips"] : styles["close-chips"]}`}>
            <SystemContextProvider
                value={{
                    setFavorite,
                    favoriteGames,
                    enabledPlaySound,
                    gamesOrder,
                    userStakeLevel,
                    enabledQuickBet,
                    betValue,
                    fractionalOddsFormat,
                }}
            >
                {enabledWinningStreakNotification && <WinningStreak ref={winningStreakRef}></WinningStreak>}
                <GameCategory
                    favoriteGames={favoriteGames}
                    selectedPage={selectedPage}
                    selectCategoryPage={selectCategoryPage}
                    selectedCategory={selectedCategory}
                />
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    <div className="star-field">
                        <div className="layer"></div>
                        <div className="layer"></div>
                        <div className="layer"></div>
                    </div>
                    {renderListGames()}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
