import React from "react";

import { useTranslate } from "@tolgee/react";
import Styles from "./confirm-message.module.scss";
import { Props } from "./type";

const ConfirmMessage: React.FC<Props> = ({ closeModal, confirmQuickBet }) => {
    const { t } = useTranslate("SabaNumber");

    const handleClose = () => {
        closeModal();
    };

    const handleConfirm = () => {
        confirmQuickBet();
    };

    return (
        <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
            <div className={Styles["popup-header"]}>
                <h1 className={Styles["popup-title"]}>
                    {t({
                        key: "quick_bet",
                    })}
                </h1>
            </div>
            <div className={Styles.message}>
                {t({
                    key: "enable_quick_bet_hint",
                })}
            </div>
            <div className={Styles["list-button"]}>
                <button className={`${Styles["btn-red"]} ${Styles["btn"]}`} onClick={handleClose} id="btn-cancel-quickbet">
                    {t({
                        key: "button_cancel",
                    })}
                </button>
                <button className={`${Styles["btn-green"]} ${Styles["btn"]}`} onClick={handleConfirm} id="btn-on-quickbet">
                    {t({
                        key: "button_enable_quickbet",
                    })}
                </button>
            </div>
        </div>
    );
};

export default ConfirmMessage;
