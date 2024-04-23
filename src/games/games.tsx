import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useContext, useEffect } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { getAppSettings } from "../_shared/app-settings";
import { GameIds, SwiperNoSwiping } from "../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../_shared/helpers";
import { SettingEventActionType, SystemContextProvider, URLContext, usePlayerContext, useSettingDispatch } from "../_shared/react-contexts";
import {
    usePlaceBetSound,
    useReceiveFinishSound,
    useStartBettingSound,
    useStartRoundSound,
    useStopBettingSound,
} from "../_shared/react-hooks";
import { tolgee } from "../_shared/tolgee";
import { BackgroundGalaxy } from "../components/page-components/background";
import PreloadImages from "../components/page-components/preload-images";
import { getChipSettings } from "../services/user-setting-service";
import styles from "./games.module.scss";
import { Props } from "./type";
import { Swiper, SwiperSlide } from "swiper/react";
import GameLoading from "../components/game-components/game-loading";
import { GlobalMessageTransmitter } from "../_shared/helpers/message-transmitter/global-transmitter";

const BacBall = dynamic(() => import("./bac-ball"));
const NextBall = dynamic(() => import("./next-ball/page"));
const Footer = dynamic(() => import("../components/game-components/footer"));
const ToolbarGuide = dynamic(() => import("../components/page-components/hide-toolbar-guide"));
const SwitchGamesGuide = dynamic(() => import("../components/page-components/switch-games-guide"));


export const Games: React.FC<Props> = ({ setApiErrorMessage, userStakeLevel, updateUserStakeLevel, openGameId, directMode, lobbyGamesIds }) => {
    const { isDirectMode } = useContext(URLContext);
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();
    console.log("openGameId", openGameId);

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

    const gameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startRoundSound: useStartRoundSound(),
        receiveFinishSound: useReceiveFinishSound(),
        startBettingSound: useStartBettingSound(locale),
        stopBettingSound: useStopBettingSound(locale),
    };

    const getGameComponentById = (gameId: number) => {
        const { gameSettings } = getAppSettings();
        console.log("render " + gameId);

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

            default:
                return null;
        }
    };

    const swiperSlideChild = ({ isActive, gameId }) => {
        if (isActive) {
            console.log({ isActive, gameId });
            GlobalMessageTransmitter.broadcast({ openingGameId: gameId });
            AnalyticsHelper.trackFunction({
                function: TrackingFunction.SwitchGame,
                action: TrackingAction.Swipe
            });

            return <>{getGameComponentById(parseInt(gameId))}</>;
        }

        return <div className={styles["skeleton-game"]} ><GameLoading /></div>;
    };

    const renderSwiperItems = () => {
        return (
            <div>
                {lobbyGamesIds.map((gameId) => {
                    console.log(`render SwiperSlide-${gameId}`);
                    const swipeItemId = `SwiperSlide-${gameId}`;

                    return (
                        <SwiperSlide
                            style={{ height: "2000px" }}
                            key={swipeItemId}
                            id={swipeItemId}
                            onChange={() => {
                                console.log(`SwiperSlide ${swipeItemId} changed`);
                            }}
                        >
                            {({ isActive }) => swiperSlideChild({ isActive, gameId })}
                        </SwiperSlide>
                    );
                })}
            </div>
        );
    };

    const renderSwiper = (openGameId: number) => {
        const gameIndex = lobbyGamesIds.indexOf(openGameId);
        console.log(`init game ${gameIndex}`);
        return (
            <Swiper
                spaceBetween={50}
                slidesPerView={1}
                loop={true}
                // onSlideChange={(swiper) => console.log("slide change", swiper.realIndex)}
                // onSwiper={(swiper) => console.log(swiper)}
                className="mySwiper-test"
                // width={250}
                autoHeight={true}
                initialSlide={gameIndex}
                noSwiping={true}
                noSwipingClass={SwiperNoSwiping}
            >
                {renderSwiperItems()}
            </Swiper>
        );
    };

    return (
        <div className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}>
            <SystemContextProvider>
                <PreloadImages />
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    <BackgroundGalaxy gameId={openGameId} />
                    {isDirectMode && <ToolbarGuide />}
                    {directMode ? getGameComponentById(openGameId) : renderSwiper(openGameId)}
                    {!isDirectMode && isMobileOnly && <SwitchGamesGuide />}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
