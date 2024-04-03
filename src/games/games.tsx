import { useTheme } from "next-themes";
import React, { useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { useSwipeable } from "react-swipeable";

import { getAppSettings } from "../_shared/app-settings";
import { GameIds } from "../_shared/constants";
import { SystemContextProvider } from "../_shared/react-contexts";
import {
    usePlaceBetSound,
    useReceiveFinishSound,
    useStartBettingSound,
    useStartRoundSound,
    useStopBettingSound,
} from "../_shared/react-hooks";
import { tolgee } from "../_shared/tolgee";
import { BackgroundGalaxy } from "../components/page-components/background";
import BacBall from "./bac-ball";
import styles from "./games.module.scss";
import NextBall from "./next-ball/page";
import { Props } from "./type";

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    userOfferGames,
    directMode,
    swipeableHandler,
}) => {
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();
    const [stopScroll, setStopScroll] = useState(false);

    const mobileSwipeableHandlers = useSwipeable({
        onSwipedUp: () => {
            swipeableHandler(true, openGameId);
            setStopScroll(true);
        },
        onSwipedDown: () => {
            swipeableHandler(false, openGameId);
            setStopScroll(true);
        },
        swipeDuration: 500,
        preventScrollOnSwipe: true,
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

    const extraProps = isMobileOnly && !directMode ? mobileSwipeableHandlers : {};

    return (
        <div
            className={`game-container ${styles["game-wrapper"]} ${styles["open-chips"]}`}
            {...extraProps}
            style={{ touchAction: stopScroll ? "none" : "auto" }}
        >
            <SystemContextProvider>
                <div className={`${styles["game-list"]} ${isMobileOnly ? styles[isIOS ? "ios-device" : "android-device"] : ""}`}>
                    <BackgroundGalaxy />
                    {getGameComponentById(openGameId)}
                </div>
            </SystemContextProvider>
        </div>
    );
};

export default Games;
