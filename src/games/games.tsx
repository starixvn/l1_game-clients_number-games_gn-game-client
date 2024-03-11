import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { getAppSettings } from "../_shared/app-settings";
import { AppTypes, GameIds } from "../_shared/constants";
import { SystemContextProvider } from "../_shared/react-contexts";
import { usePlaceBetSound } from "../_shared/react-hooks";
import { GameCategory } from "../components/page-components/game-category";
import {
    GameCategoryConfig,
    GameCategoryKeys,
    GameCategoryType,
    GamesInOnePage,
} from "../components/page-components/game-category/constants";
import BacBall from "./bac-ball";
import styles from "./games.module.scss";
import HappyFour from "./happy-four/page";
import HappyWheel from "./happy-wheel/page";
import LuckyThree from "./lucky-three/page";
import NextBall from "./next-ball/page";
import SicBalls from "./sic-balls/page";
import { Props } from "./type";

let gamesOrder = [];
const getRenderGames = (selectedCategory: GameCategoryType, selectedPage: number, userOfferGames: number[]) => {
    if (selectedCategory === GameCategoryType.newNumberGames) {
        return GameCategoryConfig[AppTypes.mobile].newNumberGames;
    }

    if (selectedCategory === GameCategoryType.game) {
        return GameCategoryConfig[AppTypes.mobile].game;
    }
    const tabGames = GameCategoryConfig[getAppSettings().appType][GameCategoryType[selectedCategory]];

    gamesOrder = getAppSettings().offeredGames.filter((gameId) => tabGames.includes(gameId));

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

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    queryGame,
    userOfferGames,
    isJoinGame,
    updateQueryGames,
    openGameId,
}) => {
    const urlHashtag = window.location.hash.replace("#", "").split("_");
    const queryCategory = isJoinGame ? getCategoryByQueryGameId(queryGame) : urlHashtag[0] || getCategoryByGameId(queryGame);
    const [selectedCategory, setSelectedCategory] = useState<GameCategoryType>(GameCategoryType[queryCategory]);
    const [selectedPage, setSelectedPage] = useState(+urlHashtag[1] + 1 || 1);
    const { theme } = useTheme();
    location.hash = `#${getCategoryHashTag(queryCategory, selectedPage)}`;
    const [isJoinedGame, setIsJoinedGame] = useState(false);
    const playPlaceBetSound = usePlaceBetSound();

    const renderListGames = () => {
        const renderGames = getRenderGames(selectedCategory, selectedPage, userOfferGames);

        return renderGames.map((gameId) => getGameComponentById(gameId));
    };

    const getGameComponentById = (gameId: number) => {
        const { gameSettings } = getAppSettings();

        const gameProps = {
            ...gameSettings[gameId],
            playPlaceBetSound,
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
        <div className={`game-container game-wrapper ${styles["open-chips"]}`}>
            <SystemContextProvider>
                <GameCategory selectedPage={selectedPage} selectCategoryPage={selectCategoryPage} selectedCategory={selectedCategory} />
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    <div className="background-galaxy">
                        <img className="galaxy-2" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                        <img className="galaxy-1" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                    </div>
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
