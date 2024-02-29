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
        <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
            <div className={Styles["popup-header"]}>
                <h1 className={Styles["popup-title"]}>{t("oneClickTitle")}</h1>
            </div>
            <div className={Styles.message}>{t("messageConfirmQuickBet")}</div>
            <div className={Styles["list-button"]}>
                <button className={`${Styles["btn-red"]} ${Styles["btn"]}`} onClick={handleClose} id="btn-cancel-quickbet">
                    {t("cancel")}
                </button>
                <button className={`${Styles["btn-green"]} ${Styles["btn"]}`} onClick={handleConfirm} id="btn-on-quickbet">
                    {t("turnOn")}
                </button>
            </div>
        </div>
    );
};

export default ConfirmMessage;
