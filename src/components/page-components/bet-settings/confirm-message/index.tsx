import { useTranslation } from "next-i18next";
import React from "react";

import Styles from "./confirm-message.module.scss";
import { Props } from "./type";

const ConfirmMessage: React.FC<Props> = ({ closeModal, confirmQuickBet }) => {
    const { t } = useTranslation("common");

    const handleClose = () => {
        closeModal();
    };

    const handleConfirm = () => {
        confirmQuickBet();
    };

    return (
        <div className="game-container">
            <div className={Styles["error-message-container"]}>
                <div className={Styles["popup-closed-icon"]} onClick={handleClose}>
                    <span className={`icon-close ${Styles["icon-close"]}`}></span>
                </div>

                <div className={Styles["popup-header"]}>
                    <h1 className={Styles["popup-title"]}>{t("oneClickTitle")}</h1>
                </div>
                <div className={Styles.message}>{t("messageConfirmQuickBet")}</div>
                <div className={Styles["list-button"]}>
                    <button className={`${Styles["btn-grey"]} ${Styles["btn"]}`} onClick={handleClose}>
                        {t("cancel")}
                    </button>
                    <button className={`${Styles["btn-red"]} ${Styles["btn"]}`} onClick={handleConfirm}>
                        {t("turnOn")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmMessage;
