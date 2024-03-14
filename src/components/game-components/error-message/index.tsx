import React from "react";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./error-message.module.scss";
import { ConnectFailedReasonKey } from "./type";

export const ConnectFailedMessage: React.FC<{ gameName: string; onSubmit: () => void; reason: string }> = ({
    gameName,
    onSubmit,
    reason,
}) => {
    const { t } = useTranslator([gameName]);
    return (
        <BaseDialog type={ModalType.Center} isOpen={true}>
            <div className={`modal-center yellow-color ${Styles["error-message-container"]}`}>
                <div className={`${Styles["warning-container"]}`}>
                    <div className={`icon-warning ${Styles["icon-warning"]}`}></div>
                </div>
                <div className={Styles["title"]}>{t(`${gameName}.game_name`)}</div>
                <div className={Styles["content"]}>{t(reason, { gameName }).replaceTolgeeFormat().replace(gameName, "")}</div>
                <div className={Styles["list-action"]}>
                    <button onClick={() => onSubmit()} className={`btn-green w-100 ${Styles["reconnect"]}`}>
                        {reason === ConnectFailedReasonKey.lostConnection
                            ? t(`${ResourceTypes.SABA_NUMBER}.button_reconnect`)
                            : t(`${ResourceTypes.COMMON}.ok`)}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};
