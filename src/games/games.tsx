import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { io, Socket } from "socket.io-client";
import useSound from "use-sound";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../_shared/app-settings";
import { getLocalStorageItem, localStorageKeys } from "../_shared/local-storage";
import { SystemContextProvider } from "../_shared/contexts/system";
import { SocketState } from "../_shared/types";
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
import messageTransmitter from "../_shared/helpers/message-transmitter";
import { buildSocketGatewayUrl } from "../_shared/helpers/url-helper";
import { AppTypes } from "../_shared/constants";
import BacBall from "./bac-ball/page";
import { GameCategory } from "../components/page-components/game-category";
import { ViewMode } from "../components/game-base/type";
import HappyFour from "./happy-four/page";
import HappyWheel from "./happyWheel/page";
import SicBalls from "./sic-balls/page";
import NextBall from "./next-ball/page";
import LuckyThree from "./lucky-three/page";

let gamesOrder = [];
const getRenderGames = (selectedCategory: GameCategoryType, selectedPage: number, favoriteGames: number[], userOfferGames: number[]) => {
    if (selectedCategory === GameCategoryType.newNumberGames) {
        return GameCategoryConfig[AppTypes.mobile].newNumberGames;
    }

    if (selectedCategory === GameCategoryType.hot) {
        return GameCategoryConfig[AppTypes.mobile].hot;
    }
    const tabGames = GameCategoryConfig[getAppSettings().appType][GameCategoryType[selectedCategory]];

    gamesOrder = getAppSettings().offeredGames.filter(
        (gameId) => !favoriteGames.includes(gameId) && tabGames.includes(gameId)
    );

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
    return "hot";
};

const getCategoryByQueryGameId = (gameId: number) => {
    return (
        GameCategoryKeys.find(
            (category) =>
                category !== "hot" &&
                GameCategoryConfig[getAppSettings().appType][category] &&
                GameCategoryConfig[getAppSettings().appType][category].includes(gameId)
        ) ?? getDefaultCategory()
    );
};

const getCategoryHashTag = (category: string, pageIndex: number) => {
    return pageIndex > 1 ? `${category}_${pageIndex - 1}` : category;
};

const getUpdatedFavoriteList = (gameId: number, isFavorite: boolean) => {
    const favorites = getLocalStorageItem<number[]>(localStorageKeys.favoriteGames) ?? [];
    const newFavoriteList = [...favorites];
    const gameIndex = newFavoriteList.indexOf(gameId);

    gameIndex >= 0 && newFavoriteList.splice(gameIndex, 1);

    isFavorite && newFavoriteList.push(gameId);

    return newFavoriteList;
};

const GlobalMessageTransmitter = messageTransmitter();

const registerGlobalMessageEvent = (messageKey: string, handler: Function) => {
    GlobalMessageTransmitter.register(messageKey, handler);
};

const unsubscribeGlobalMessageEvent = (listenerId: string) => {
    GlobalMessageTransmitter.unsubscribe(listenerId);
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
    const socketGatewayRef = useRef<Socket>(null);
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
            socketGateway: socketGatewayRef.current,
            socketGatewayState: socketState,
            retryConnectSocket: connectSocket,
            registerGlobalMessageEvent: registerGlobalMessageEvent,
            unsubscribeGlobalMessageEvent: unsubscribeGlobalMessageEvent,
            finishJoinGame: () => setIsJoinedGame(true),
            isJoinedGame: isJoinedGame,
        };

        switch (gameId) {
            case 1001:
                return <BacBall />;
            case 1112:
                return <HappyFour />;
            case 1113:
                return <HappyWheel />;
            case 1114:
                return <LuckyThree />;
            case 1115:
                return <NextBall />;
            case 1116:
                return <SicBalls />;

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

    const connectSocket = () => {
        const { enableMsgpackParser } = getAppSettings();
        const socketGatewayUrl = buildSocketGatewayUrl();
        const socket = io(socketGatewayUrl, {
            forceNew: true,
            transports: ["websocket"],
            upgrade: false,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        });

        socket.on("connect", () => {
            setSocketState(SocketState.Connected);
        });
        socket.on("connect_error", () => {
            setSocketState(SocketState.Error);
        });
        socket.on("disconnect", (reason) => {
            setSocketState(SocketState.Disconnected);
            console.log(reason);
        });

        socket.on("message", (message) => {
            GlobalMessageTransmitter.broadcast(message);
        });

        socketGatewayRef.current = socket;
    };

    useEffect(() => {
        setIsJoinedGame(false);
    }, [openGameId, isJoinGame]);

    useEffect(() => {
        connectSocket();

        return () => {
            socketGatewayRef.current.close();
        };
    }, []);

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
                    {renderListGames()}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
