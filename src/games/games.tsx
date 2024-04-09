import { useTheme } from "next-themes";
import React, { useContext, useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { useSwipeable } from "react-swipeable";

import dynamic from "next/dynamic";
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

const ToolbarGuide = dynamic(() => import("../components/page-components/hide-toolbar-guide"));

const gamesConstants = {
    standardMobileHeight: 670,
    swipeDuration: 1500,
};

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    directMode,
    swipeableHandler,
    headerRef,
    onDisableSwipeReceive,
}) => {
    const { isDirectMode } = useContext(URLContext);
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();
    const [height, setHeight] = useState(0);
    const contentRef = useRef(null);
    const [stopScroll, setStopScroll] = useState(false);
    const [extraProps, setExtraProps] = useState({});
    const { session } = usePlayerContext();
    const settingDispatch = useSettingDispatch();
    const [allowSwipeable, setAllowSwipeable] = useState(true);

    useEffect(() => {
        if (contentRef.current && height !== contentRef.current.offsetHeight && isMobileOnly && openGameId > 0) {
            setHeight(contentRef.current.offsetHeight);

            if (checkAllowSwipeable()) {
                if (allowSwipeable) {
                    setExtraProps(isMobileOnly && !directMode ? mobileSwipeableHandlers : {});
                }
            } else {
                setAllowSwipeable(false);
                setExtraProps({});
                onDisableSwipeReceive();
            }
        }

        return () => {
            setExtraProps({});
        };
    }, [contentRef.current?.getContext, openGameId]);

    const checkAllowSwipeable = () => {
        return contentRef.current.offsetHeight <= window.innerHeight;
    };

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

    const onSwipeHandler = (isUp: boolean) => {
        if (!checkAllowSwipeable()) {
            return;
        }
        swipeableHandler(!isUp, openGameId);
        setStopScroll(true);
    };

    const mobileSwipeableHandlers = useSwipeable({
        onSwipedUp: () => onSwipeHandler(true),
        onSwipedDown: () => onSwipeHandler(false),
        swipeDuration: gamesConstants.swipeDuration,
        trackMouse: true,
    });

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
        <div
            className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}
            {...extraProps}
            style={{ touchAction: stopScroll ? "none" : "auto" }}
        >
            <SystemContextProvider>
                <div
                    ref={contentRef}
                    className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}
                >
                    <BackgroundGalaxy />
                    {isDirectMode && <ToolbarGuide />}

                    {getGameComponentById(openGameId)}
                </div>
            </SystemContextProvider>
            <Footer />
        </div>
    );
};

export default Games;
