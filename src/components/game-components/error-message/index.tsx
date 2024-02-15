import React from "react";

import { useTranslate } from "@tolgee/react";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./error-message.module.scss";
import { ConnectFailedReasonKey } from "./type";

export const ConnectFailedMessage: React.FC<{ gameName: string; onSubmit: () => void; reason: string }> = ({
    gameName,
    onSubmit,
    reason,
}) => {
    const { t } = useTranslate(["Common", "SabaNumber"]);

    return (
        <BaseDialog type={ModalType.Center} isOpen={true}>
            <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
                <div className={`${Styles["warning-container"]}`}>
                    <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
                </div>
                <div className={Styles["title"]}>{gameName}</div>
                <div className={Styles["content"]}>{t({ key: "splash_connection_lost" })}</div>
                <div className={Styles["list-action"]}>
                    <button onClick={() => onSubmit()} className={`btn-red w-100 ${Styles["reconnect"]}`}>
                        {reason === ConnectFailedReasonKey.lostConnection ? t({ key: "reconnect" }) : t({ key: "ok" })}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};
