import React from "react";

import { useTranslate } from "@tolgee/react";
import Styles from "./quick-bet-hint.module.scss";
import { Props } from "./type";

const QuickBetHint: React.FC<Props> = ({ closeModal, confirmQuickBet }) => {
    const { t } = useTranslate("SabaNumber");

    const handleClose = () => {
        closeModal();
    };

    const handleConfirm = () => {
        confirmQuickBet();
    };

    const translate = (key) => {
        return t({
            key,
        });
    };

    return (
        <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
            <div className={Styles["popup-header"]}>
                <h1 className={Styles["popup-title"]}>{translate("quick_bet")}</h1>
            </div>
            <div className={Styles.message}>{translate("enable_quick_bet_hint")}</div>
            <div className={Styles["list-button"]}>
                <button className={`${Styles["btn-red"]} ${Styles["btn"]}`} onClick={handleClose} id="btn-cancel-quickbet">
                    {translate("button_cancel")}
                </button>
                <button className={`${Styles["btn-green"]} ${Styles["btn"]}`} onClick={handleConfirm} id="btn-on-quickbet">
                    {translate("button_enable_quickbet")}
                </button>
            </div>
        </div>
    );
};

export default QuickBetHint;
