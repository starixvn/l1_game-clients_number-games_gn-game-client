import React from "react";

import { Markup } from "interweave";
import { useSNTranslate } from "../../../../_shared/react-hooks";
import Styles from "./quick-bet-hint.module.scss";
import { Props } from "./type";

const QuickBetHint: React.FC<Props> = ({ closeModal, confirmQuickBet }) => {
    const { t } = useSNTranslate();

    const handleClose = () => {
        closeModal();
    };

    const handleConfirm = () => {
        confirmQuickBet();
    };

    return (
        <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
            <div className={Styles["popup-header"]}>
                <h1 className={Styles["popup-title"]}>{t("quick_bet")}</h1>
            </div>
            <div className={Styles.message}>
                <Markup content={t(`message_quick_bet`).replaceTolgeeFormat()}></Markup>
            </div>
            <div className={Styles["list-button"]}>
                <button className={`${Styles["btn-red"]} ${Styles["btn"]}`} onClick={handleClose} id="btn-cancel-quickbet">
                    {t("button_cancel")}
                </button>
                <button className={`${Styles["btn-green"]} ${Styles["btn"]}`} onClick={handleConfirm} id="btn-on-quickbet">
                    {t("button_enable_quickbet")}
                </button>
            </div>
        </div>
    );
};

export default QuickBetHint;
