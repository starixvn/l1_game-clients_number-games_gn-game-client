import { useTranslation } from "next-i18next";
import React, { forwardRef, useImperativeHandle, useState } from "react";

import { GameResourceKeys } from "../../../_shared/resources";
import styles from "./winning-streak.module.scss";
import { WinningStreakItem } from "./winning-streak.type";

const FishPrawnCrabIconMapper = {
    fish: "icon-ca",
    prawn: "icon-tom",
    crab: "icon-cua",
    stag: "icon-nai",
    gourd: "icon-bau",
    rooster: "icon-ga",
};

const GamesHaveNoTextOnIcon = ["fishprawncrab", "sedie", "vipsedie", "minisedie", "specialsedie", "threecards"];

const getIconClassName = (gameName: string, choice: string) => {
    const gameNameLower = gameName.toLocaleLowerCase();
    switch (gameNameLower) {
        case "fishprawncrab":
            return `${styles.dice} ${FishPrawnCrabIconMapper[choice]}`;
        default:
            return styles[`dot-${choice}`];
    }
};

const getTextOnIconChoice = (gameName: string, choice: string, translate: Function) => {
    const gameNameLowerCase = gameName.toLocaleLowerCase();
    if (GamesHaveNoTextOnIcon.includes(gameNameLowerCase)) {
        return "";
    }

    return translate(`${gameNameLowerCase}:${choice}TextDot`);
};

const winningStreak = {};

// eslint-disable-next-line react/display-name
export const WinningStreak = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const [winningStreakQueue, setWinningStreakQueue] = useState<{ [key: string]: WinningStreakItem }>({});

    useImperativeHandle(ref, () => ({
        addWinningStreak(streak: WinningStreakItem) {
            winningStreak[streak.key] = streak;

            setWinningStreakQueue({ ...winningStreak });

            setTimeout(() => removeWinStreakNotification(streak.key), 4 * 1000);
        },
    }));

    const removeWinStreakNotification = (key: string) => {
        delete winningStreak[key];
        setWinningStreakQueue({ ...winningStreak });
    };

    return (
        <div className={styles["winning-streak-container"]}>
            {Object.values(winningStreakQueue).map(({ gameName, choice, streak, key, optional }) => {
                return (
                    <div key={key} className={styles["streak-notification"]}>
                        <div className={styles["game-name"]}>{t(`${gameName.toLocaleLowerCase()}:${GameResourceKeys.GAME_NAME}`)}</div>
                        {optional && <span className={styles["optional"]}>{optional}</span>}
                        <span className={`${styles["option-icon"]} ${getIconClassName(gameName, choice)}`}>
                            {getTextOnIconChoice(gameName, choice, t)}
                        </span>
                        <span>
                            x <span className={styles["number"]}>{streak}</span>
                        </span>
                        <span className={`icon-close ${styles["icon-close"]}`} onClick={() => removeWinStreakNotification(key)}></span>
                    </div>
                );
            })}
        </div>
    );
});
