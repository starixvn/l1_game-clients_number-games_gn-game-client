import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { useSwipeable } from "react-swipeable";
import { getAppSettings } from "../_shared/app-settings";
import { GameIds } from "../_shared/constants";
import { SystemContextProvider, URLContext, SettingEventActionType, usePlayerContext, useSettingDispatch } from "../_shared/react-contexts";
import {
    usePlaceBetSound,
    useReceiveFinishSound,
    useStartBettingSound,
    useStartRoundSound,
    useStopBettingSound,
} from "../_shared/react-hooks";
import { tolgee } from "../_shared/tolgee";
import Footer from "../components/game-components/footer";
import { BackgroundGalaxy } from "../components/page-components/background";
import BacBall from "./bac-ball";
import styles from "./games.module.scss";
import NextBall from "./next-ball/page";
import { Props } from "./type";
import { getChipSettings } from "../services/user-setting-service";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../_shared/helpers";
import SwitchGamesGuide from "../components/page-components/switch-games-guide";

const ToolbarGuide = dynamic(() => import("../components/page-components/hide-toolbar-guide"));

const swipeDuration = 250;

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    swipeableHandler,
    directMode
}) => {
    const { isDirectMode } = useContext(URLContext);
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();
    const swipeableRef = React.useRef(null);

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

    const onSwipeHandler = (isRightSwipeable: boolean) => {
        swipeableHandler(!isRightSwipeable, openGameId);

        AnalyticsHelper.trackFunction({
            function: TrackingFunction.SwitchGame,
            action: isRightSwipeable ? TrackingAction.SwipeRight : TrackingAction.SwipeLeft,
        });
    };

    const mobileSwipeableHandlers = useSwipeable({
        onSwipedRight: () => onSwipeHandler(true),
        onSwipedLeft: () => onSwipeHandler(false),
        swipeDuration: swipeDuration,
        trackMouse: true,
        preventScrollOnSwipe: true
    });

    const swipeableRefPassthrough = (el: HTMLDivElement) => {
        if (isMobileOnly && !directMode) {
            mobileSwipeableHandlers.ref(el);
            swipeableRef.current = el;
        }
    }

    const gameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startRoundSound: useStartRoundSound(),
        receiveFinishSound: useReceiveFinishSound(),
        startBettingSound: useStartBettingSound(locale),
        stopBettingSound: useStopBettingSound(locale),
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
            swipeableRef: swipeableRefPassthrough
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

    return (
        <div className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}>
            <SystemContextProvider>
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    <BackgroundGalaxy />
                    {isDirectMode && <ToolbarGuide />}

                    {getGameComponentById(openGameId)}

                    {!isDirectMode && <SwitchGamesGuide />}
                </div>
            </SystemContextProvider>
            <Footer />
        </div>
    );
};

export default Games;
