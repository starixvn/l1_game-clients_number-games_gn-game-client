import { useTranslation } from "next-i18next";
import React, { useState, useEffect } from "react";

import { getAppSettings } from "../../../../_shared/app-settings";
import BaseDialog from "../../../game-components/base-dialog";
import { GameSelector } from "../../../game-components/game-selector";
import GameGuides from "./game-guide";
import Styles from "./game-guide-modal.module.scss";

export type GameConfigs = {
    maxBet: number;
    minBet: number;
    maxBetPerChoices: any;
};

export const GameGuideModal: React.FC<{
    onCloseModal: Function;
    userStakeLevel;
    offerGames: number[];
    settingGames: any;
}> = ({ onCloseModal, userStakeLevel, offerGames, settingGames }) => {
    const [selectedGameId, setSelectedGameId] = useState<number>(
        getAppSettings().offeredGames.filter((game) => offerGames.includes(game))[0]
    );
    const [gameConfigs, setGameConfigs] = useState<GameConfigs>();
    const { t } = useTranslation();
    const closeModal = () => {
        onCloseModal();
    };
    useEffect(() => {
        settingGames.forEach((game) => {
            if (game.gameId === selectedGameId) {
                setGameConfigs({
                    maxBetPerChoices: game.maxBetPerChoices,
                    maxBet: game.maxBet,
                    minBet: game.minBet,
                });
            }
        });
    }, [selectedGameId]);

    return (
        <BaseDialog onCloseModal={closeModal} enableBackdrop={true}>
            <div className={Styles["popup-container"]}>
                <div className={Styles["title"]}>{t("popupTitleGuide")}</div>
                <span className={`icon-close ${Styles["icon-close"]}`} onClick={closeModal} data-testid="icon-close"></span>
                <div className={Styles["form"]}>
                    <span className={Styles["form-label"]}>{t("common:game")}</span>
                    <GameSelector onChangeGame={setSelectedGameId} selectedGame={selectedGameId} offerGames={offerGames} />
                </div>
                <div className={Styles["guide-content"]}>
                    {selectedGameId !== -1 && (
                        <GameGuides gameId={selectedGameId} userStakeLevel={userStakeLevel} gameConfigs={gameConfigs} />
                    )}
                </div>
            </div>
        </BaseDialog>
    );
};
