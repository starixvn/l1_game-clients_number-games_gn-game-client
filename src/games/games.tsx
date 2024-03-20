import { useTheme } from "next-themes";
import React from "react";
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
import HappyFour from "./happy-four/page";
import HappyWheel from "./happy-wheel/page";
import LuckyThree from "./lucky-three/page";
import NextBall from "./next-ball/page";
import SicBalls from "./sic-balls/page";
import { Props } from "./type";
import { BackgroundGalaxy } from "../components/page-components/background";

export const Games: React.FC<Props> = ({ setApiErrorMessage, userStakeLevel, updateUserStakeLevel, openGameId, userOfferGames }) => {
    const { theme } = useTheme();
    const locale = tolgee.getLanguage();

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
        };

        if (!isGameOffered) {
            return <>Not Offer Game</>;
        }

        switch (gameId) {
            case GameIds.BacBall1:
            case GameIds.BacBall2:
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

    return (
        <div className={`game-container game-wrapper ${styles["open-chips"]}`}>
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
