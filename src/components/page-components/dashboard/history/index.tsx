import React, { useState } from "react";
import { getAppSettings } from "../../../../_shared/app-settings";
import { useSNTranslate } from "../../../../_shared/react-hooks/use-translator";
import BaseDialog from "../../../game-components/base-dialog";
import GameSelector from "../../../game-components/game-selector";
import Styles from "./history.module.scss";

export const HistoryModal: React.FC<{ onCloseModal: Function; offerGames: number[]; fractionalOddsFormat: boolean | undefined }> = ({
    onCloseModal,
    offerGames,
    fractionalOddsFormat,
}) => {
    const { t } = useSNTranslate();
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
                    <span className={Styles["form-label"]}>{t("game")}</span>
                    <GameSelector onChangeGame={setSelectedGameId} selectedGame={selectedGameId} offerGames={offerGames} />
                </div>
                <div className={`w-100 ${Styles["history-content"]}`}>{renderHistory()}</div>
            </div>
        </BaseDialog>
    );
};
