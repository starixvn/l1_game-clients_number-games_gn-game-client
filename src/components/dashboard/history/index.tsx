import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { getAppSettings } from "../../../common/app-settings";
import BaseDialog from "../../shared/base-dialog";
import GameSelector from "../../shared/game-selector";
import Styles from "./history.module.scss";

export const HistoryModal: React.FC<{ onCloseModal: Function; offerGames: number[]; fractionalOddsFormat: boolean | undefined }> = ({
    onCloseModal,
    offerGames,
    fractionalOddsFormat,
}) => {
    const { t } = useTranslation();
    const [selectedGameId, setSelectedGameId] = useState<number>(
        getAppSettings().offeredGames.filter((game) => offerGames.includes(game))[0]
    );
    const closeModal = () => {
        onCloseModal();
    };

    const renderHistory = () => {
        switch (selectedGameId) {
            default:
                return <></>;
        }
    };

    return (
        <BaseDialog onCloseModal={closeModal} enableBackdrop={true}>
            <div className={`w-100 ${Styles["popup-container"]}`}>
                <div className={Styles["title"]}>{t("popupTitleHistory")}</div>
                <span className={`icon-close ${Styles["icon-close"]}`} onClick={closeModal} data-testid="icon-close"></span>
                <div className={Styles["form"]}>
                    <span className={Styles["form-label"]}>{t("common:game")}</span>
                    <GameSelector onChangeGame={setSelectedGameId} selectedGame={selectedGameId} offerGames={offerGames} />
                </div>
                <div className={`w-100 ${Styles["history-content"]}`}>{renderHistory()}</div>
            </div>
        </BaseDialog>
    );
};
