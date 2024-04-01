import { useTheme } from "next-themes";
import React, { useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
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
import BacBall from "./bac-ball";
import styles from "./games.module.scss";
import NextBall from "./next-ball/page";
import { Props } from "./type";
import { BackgroundGalaxy } from "../components/page-components/background";
import { useSwipeable } from "react-swipeable";

export const Games: React.FC<Props> = ({
    setApiErrorMessage,
    userStakeLevel,
    updateUserStakeLevel,
    openGameId,
    userOfferGames,
    openGame }) => {
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();
    const [stopScroll, setStopScroll] = useState(false);

    const swipeableHandler = (isSwipedUp: boolean) => {
        const { consequencesGames } = getAppSettings();
        const lastedGameIdIndex = consequencesGames.length - 1;
        const currentGameIdIndex = consequencesGames.findIndex(number => number === openGameId);

        if (currentGameIdIndex === -1) {
            return;
        }

        let nextOpenedGameIdIndex = isSwipedUp ? (currentGameIdIndex === 0 ? lastedGameIdIndex : currentGameIdIndex - 1) :
            (currentGameIdIndex === lastedGameIdIndex ? 0 : currentGameIdIndex + 1);

        openGame(consequencesGames[nextOpenedGameIdIndex]);
        setStopScroll(true);
    }

    const handlers = useSwipeable({
        onSwipedUp: () => swipeableHandler(true),
        onSwipedDown: () => swipeableHandler(false),
    });

    const gameSound = {
        playPlaceBetSound: usePlaceBetSound(),
        startRoundSound: useStartRoundSound(),
        receiveFinishSound: useReceiveFinishSound(),
        startBettingSound: useStartBettingSound(locale),
        stopBettingSound: useStopBettingSound(locale),
    };

    const getGameComponentById = (gameId: number) => {
        const isGameOffered = userOfferGames.includes(gameId);
        const { gameSettings } = getAppSettings();

        const gameProps = {
            ...gameSettings[gameId],
            gameSound,
            setApiErrorMessage: setApiErrorMessage,
            theme,
            userStakeLevel,
            updateUserStakeLevel,
            openGame
        };

        if (!isGameOffered) {
            return <>Not Offer Game</>;
        }

        switch (gameId) {
            case GameIds.BacBall1:
            case GameIds.BacBall2:
                return <BacBall key={`game-${gameId}`} {...gameProps} />;

            case GameIds.NextBall1:
            case GameIds.NextBall2:
                return <NextBall key={`game-${gameId}`}  {...gameProps} />;

            default:
                return null;
        }
    };

    return (
        <div className={`game-container game-wrapper ${styles["open-chips"]}`} {...handlers} style={{ touchAction: stopScroll ? 'none' : 'auto' }}>
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
