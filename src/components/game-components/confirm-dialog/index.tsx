import { Markup } from "interweave";
import React from "react";
import { useClickSound, useSNTranslate } from "../../../_shared/react-hooks";
import BaseDialog, { Props } from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./confirm-dialog.module.scss";

type SubmitDialogProps = { onSubmit?: Function; title: string; content: string; subContent: string };

export const ConfirmDialog: React.FC<Props & SubmitDialogProps> = ({
    onCloseModal = null,
    isOpen = false,
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
    const clickSound = useClickSound();

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
                <div className={Styles.title}>{title}</div>
                <div className={Styles.content}>
                    <Markup content={content} />
                </div>
                <div className={Styles["sub-content"]}>
                    <Markup content={subContent} />
                </div>
                <div className={Styles["list-action"]}>
                    <button
                        className={`btn-grey`}
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                        type="button"
                        data-testid="btn-no-summit-dialog"
                    >
                        {t("button_no")}
                    </button>
                    <button
                        className={`btn-green`}
                        onClick={() => {
                            clickSound();
                            onSubmit?.();
                        }}
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
