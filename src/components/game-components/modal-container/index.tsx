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
            <div className={`${Styles["modal-body"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
                <div className={Styles["title"]}>
                    {title}
                    <div className={`icon-close ${Styles["icon-close"]}`} onClick={() => onCloseModal()}></div>
                </div>

                <div className="content">{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
