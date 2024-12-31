import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useRef } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { Swiper, SwiperSlide } from "swiper/react";

import { getAppSettings } from "../_shared/app-settings";
import { GameIds, SwiperNoSwiping } from "../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../_shared/helpers";
import { GAME_DEFAULTS } from "../_shared/helpers/device-helper";
import {
    SettingEventActionType,
    SystemContextProvider,
    updateURLContext,
    URLContext,
    usePlayerContext,
    useSettingDispatch,
} from "../_shared/react-contexts";
import { useBlockBetSound, usePlaceBetSound, useStartDrawSound, useStartRoundSound } from "../_shared/react-hooks";
import useDetectDevice from "../_shared/react-hooks/use-detect-device";
import { GameSound } from "../components/game-base/type";
import GameLoading from "../components/game-components/game-loading";
import { LoadingSpinner } from "../components/game-components/game-loading/loading-spinner";
import { getChipSettings } from "../services/user-setting-service";
import styles from "./games.module.scss";
import { Props } from "./type";

const LoadingGameComponent = () => (
    <>
        <GameLoading />
        <LoadingSpinner />
    </>
);
const SwitchGamesGuide = dynamic(() => import("../components/page-components/switch-games-guide"));
const BacBall = dynamic(() => import("./bac-ball"), { loading: () => <LoadingGameComponent /> });
const NextBall = dynamic(() => import("./next-ball/page"), { loading: () => <LoadingGameComponent /> });
const SeBall = dynamic(() => import("./se-ball/page"), { loading: () => <LoadingGameComponent /> });
const LuckyThree = dynamic(() => import("./lucky-three/page"), { loading: () => <LoadingGameComponent /> });
const SicBall = dynamic(() => import("./sic-ball/page"), { loading: () => <LoadingGameComponent /> });

export const Games: React.FC<Props> = ({
    swiperRef,
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    directMode,
    lobbyGamesIds,
}) => {
    const { isDirectMode } = useContext(URLContext);
    const { theme } = useTheme();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();
    const { resultAreaHeight, resultHeight, gameScale, viewportWidth } = useDetectDevice();
    const gameRef = useRef(null);

    useEffect(() => {
        (async () => {
            const chipSettings = await getChipSettings(session);
            settingDispatch({
                type: SettingEventActionType.UPDATE_CHIPS,
                payload: {
                    chipSettings: chipSettings?.chips,
                },
            });
        })();
    }, []);

    useEffect(() => {
        gameRef.current.style.setProperty("--game-scale", isMobileOnly ? gameScale : 1);
        gameRef.current.style.setProperty(
            "--result-area-height",
            isMobileOnly ? resultAreaHeight + "px" : GAME_DEFAULTS.MAX_RESULT_AREA_HEIGHT + "px"
        );
        gameRef.current.style.setProperty("--result-height", isMobileOnly ? resultHeight + "px" : GAME_DEFAULTS.MAX_RESULT_HEIGHT + "px");
        gameRef.current.style.setProperty("--viewport-width", viewportWidth);
    }, [gameScale, resultAreaHeight, resultHeight, viewportWidth]);

    const gameSound: GameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startPlaceBetSound: useStartDrawSound(),
        startRoundSound: useStartRoundSound(),
        blockBetSound: useBlockBetSound(),
    };

    const getGameComponentById = (gameId: number) => {
        const { gameSettings } = getAppSettings();

        const gameProps = {
            ...gameSettings[gameId],
            gameSound,
            setApiErrorMessage: setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
        };

        switch (gameId) {
            case GameIds.BacBall1:
            case GameIds.BacBall2:
                return <BacBall key={`game-${gameId}`} {...gameProps} />;

            case GameIds.NextBall1:
            case GameIds.NextBall2:
                return <NextBall key={`game-${gameId}`} {...gameProps} />;

            case GameIds.SeBall1:
                return <SeBall key={`game-${gameId}`} {...gameProps} />;

            case GameIds.LuckyThree:
                return <LuckyThree key={`game-${gameId}`} {...gameProps} />;

            case GameIds.SicBall:
                return <SicBall key={`game-${gameId}`} {...gameProps} />;
            default:
                return null;
        }
    };

    const swiperSlideChild = ({ isActive, gameId }) => {
        if (isActive) {
            +gameId !== +openGameId && updateURLContext({ gameId });

            return getGameComponentById(parseInt(gameId));
        }

        return (
            <div className={styles["skeleton-game"]}>
                <GameLoading />
            </div>
        );
    };

    const renderSwiperItems = () => {
        return (
            <div>
                {lobbyGamesIds.map((gameId) => {
                    const swipeItemId = `SwiperSlide-${gameId}`;

                    return (
                        <SwiperSlide style={{ height: "auto" }} key={swipeItemId} id={swipeItemId}>
                            {({ isActive }) => swiperSlideChild({ isActive, gameId })}
                        </SwiperSlide>
                    );
                })}
            </div>
        );
    };

    const renderSwiper = (openGameId: number) => {
        const gameIndex = lobbyGamesIds.indexOf(openGameId);

        const isSSOToNonOfferGame = gameIndex < 0;
        if (isSSOToNonOfferGame) {
            return getGameComponentById(openGameId);
        }
        return (
            <Swiper
                onBeforeInit={(swiper) => (swiperRef.current = swiper)}
                speed={isMobileOnly ? 100 : 500}
                spaceBetween={50}
                slidesPerView={1}
                loop={true}
                autoHeight={false}
                initialSlide={gameIndex}
                noSwiping={true}
                noSwipingClass={SwiperNoSwiping}
                onRealIndexChange={(swiper) => {
                    AnalyticsHelper.trackFunction({
                        function: TrackingFunction.SwitchGame,
                        action: TrackingAction.Swipe,
                    });
                }}
            >
                {renderSwiperItems()}
            </Swiper>
        );
    };

    return (
        <div ref={gameRef} className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}>
            <SystemContextProvider>
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    {directMode ? getGameComponentById(openGameId) : renderSwiper(openGameId)}
                    {!isDirectMode && isMobileOnly && <SwitchGamesGuide />}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
