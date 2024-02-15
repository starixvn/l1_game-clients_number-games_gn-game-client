import { useTranslate } from "@tolgee/react";
import React from "react";
import BaseDialog, { Props } from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./submit-dialog.module.scss";

type SubmitDialogProps = { onSubmit?: Function; title; content; subContent };

export const SubmitDialog: React.FC<Props & SubmitDialogProps> = ({
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
    const { t } = useTranslate(["SabaNumber"]);

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
                        data-testid="btn-submit-gallery"
                    >
                        {t({ key: "no" })}
                    </button>
                    <button
                        className={`btn-red ${Styles["btn-no"]}`}
                        onClick={() => onSubmit()}
                        type="button"
                        data-testid="btn-submit-gallery"
                    >
                        {t({ key: "yes" })}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default SubmitDialog;
