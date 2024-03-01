import { FC } from "react";

import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./modal-container.module.scss";

const ModalContainer: FC<{
    title: string;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap }) => {
    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div className={`${Styles["modal-full"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
                <div className={Styles["title"]}>
                    {title}
                    <span className={`icon-close ${Styles["icon-close"]}`} onClick={() => onCloseModal()}></span>
                </div>

                <div className={`${Styles["content"]}`}>{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
