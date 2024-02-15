import React from "react";

import { useTranslate } from "@tolgee/react";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./disabled-modal.module.scss";

const DisabledModal: React.FC<{ disableMessage: string; onSubmit: () => void }> = ({ disableMessage, onSubmit }) => {
    const { t } = useTranslate(["Common", "SabaNumber"]);
    const isDisable = disableMessage === "";
    return (
        <BaseDialog type={ModalType.Center} isOpen={true}>
            <div className={`modal-center yellow-color ${Styles["disable-message-container"]}`}>
                <div className={`${Styles["warning-container"]}`}>
                    <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
                </div>
                {isDisable ? (
                    <div className={Styles.message}>{disableMessage}</div>
                ) : (
                    <div className={Styles.message}>{t({ key: "message_disabled_game" })}</div>
                )}

                <div className={Styles["list-action"]}>
                    <button onClick={() => onSubmit()} className={`btn-red w-100 ${Styles["ok"]}`}>
                        {t({ key: "ok" })}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default DisabledModal;
