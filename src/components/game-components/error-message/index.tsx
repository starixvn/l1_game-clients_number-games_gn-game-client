import { Trans, useTranslation } from "next-i18next";
import React, { useEffect } from "react";

import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./error-message.module.scss";
import { ConnectFailedReasonKey, Props } from "./type";

export const ErrorMessage: React.FC<Props> = ({ message, closeModal }) => {
    useEffect(() => {
        const timeOut = setTimeout(() => closeModal(), 3000);

        return () => {
            clearTimeout(timeOut);
        };
    }, []);

    return (
        <div className={Styles["error-message-container"]}>
            <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
            <div className={`icon-close ${Styles["icon-close"]}`} onClick={() => closeModal()}></div>
            <div className={Styles.message} key={Math.random()}>
                {message}
            </div>
        </div>
    );
};

export const ConnectFailedMessage: React.FC<{ gameName: string; onSubmit: () => void; reason: string }> = ({
    gameName,
    onSubmit,
    reason,
}) => {
    const { t } = useTranslation("messages");
    return (
        <BaseDialog type={ModalType.Center} isOpen={true}>
            <div className={Styles["error-message-container"]}>
                <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
                <div className={Styles.message}>
                    <Trans t={t}>{t(reason, { gameName: gameName })}</Trans>
                </div>
                <div className={Styles["list-action"]}>
                    <button onClick={() => onSubmit()} className={`btn-red w-100 ${Styles["reconnect"]}`}>
                        {reason === ConnectFailedReasonKey.lostConnection ? t("common:socketReconnect") : "Ok"}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};
