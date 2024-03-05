import React from "react";
import { useSNTranslate } from "../../../_shared/react-hooks";
import BaseDialog, { Props } from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./confirm-dialog.module.scss";

type SubmitDialogProps = { onSubmit?: Function; title; content; subContent };

export const ConfirmDialog: React.FC<Props & SubmitDialogProps> = ({
    onCloseModal = null,
    isOpen = true,
    type = ModalType.Full,
    betContainerPosition,
    enableBackdrop,
    toggleBtnRef,
    isBlockUI,
    onSubmit = null,
    title,
    content,
    subContent,
}: Props & SubmitDialogProps) => {
    const { t } = useSNTranslate();

    return (
        <BaseDialog
            type={type}
            isOpen={isOpen}
            onCloseModal={onCloseModal}
            betContainerPosition={betContainerPosition}
            enableBackdrop={enableBackdrop}
            toggleBtnRef={toggleBtnRef}
            isBlockUI={isBlockUI}
        >
            <div className={`modal-center yellow-color ${Styles["submit-dialog-container"]}`}>
                <div className={Styles.title} key={Math.random()}>
                    {title}
                </div>
                <div className={Styles.content} key={Math.random()}>
                    {content}
                </div>
                <div className={Styles["sub-content"]} key={Math.random()}>
                    {subContent}
                </div>
                <div className={Styles["list-action"]}>
                    <button
                        className={`btn-red ${Styles["btn-yes"]}`}
                        onClick={() => onCloseModal()}
                        type="button"
                        data-testid="btn-no-summit-dialog"
                    >
                        {t("button_no")}
                    </button>
                    <button
                        className={`btn-red ${Styles["btn-no"]}`}
                        onClick={() => onSubmit()}
                        type="button"
                        data-testid="btn-yes-summit-dialog"
                    >
                        {t("button_yes")}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default ConfirmDialog;
