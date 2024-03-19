import { FC } from "react";

import { useClickSound } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { isMobileOnly } from "react-device-detect";
import Styles from "./modal-container.module.scss";

const ModalContainer: FC<{
    id?: string;
    title: React.ReactNode;
    children?: React.ReactNode;
    onCloseModal: Function;
    isOpen: boolean;
    isOverlap?: boolean;
}> = ({ title, children, onCloseModal, isOpen, isOverlap, id }) => {
    const clickSound = useClickSound();

    return (
        <BaseDialog type={ModalType.Full} enableBackdrop={true} isOverlap={isOverlap}>
            <div id={id} className={`${Styles["modal-full"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
                <div className={Styles["title"]}>
                    {title}
                    <span
                        className={`icon-close ${Styles["icon-close"]}`}
                        onClick={() => {
                            clickSound();
                            onCloseModal();
                        }}
                    ></span>
                </div>

                <div className={`${Styles["content"]} ${isMobileOnly ? Styles["mobile"] : ""}`}>{children}</div>
            </div>
        </BaseDialog>
    );
};

export default ModalContainer;
