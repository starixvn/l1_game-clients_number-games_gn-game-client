import { FC } from "react";

import Styles from "./base-modal.module.scss";

export type BaseModalProps = {
    title: string;
    isOpen?: boolean;
    children?: React.ReactNode;
    onCloseModal?: Function;
};

const BaseModal: FC<BaseModalProps> = ({ isOpen, children, onCloseModal, title }) => {
    const handleCloseModal = () => {
        document.body.classList.remove("no-scroll");
        onCloseModal?.();
    };

    if (isOpen) {
        document.body.classList.add("no-scroll");
    }

    return (
        <div className={`${Styles["overlay"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
            <div className={Styles["modal-body"]}>
                <div className={Styles["title"]}>
                    {title}

                    <div className={`icon-close ${Styles["icon-close"]}`} onClick={handleCloseModal}></div>
                </div>

                <div className="content">{children}</div>
            </div>
        </div>
    );
};

export default BaseModal;
