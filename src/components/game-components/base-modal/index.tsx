import { FC } from "react";
import Styles from "./base-modal.module.scss";

export type BaseModalProps = {
    title: string;
    isOpen?: boolean;
    children?: React.ReactNode;
    onCloseModal?: Function;
};

const BaseModal: FC<BaseModalProps> = ({ isOpen,  children, onCloseModal, title }) => {
    return <div className={`${Styles["overlay"]} ${isOpen ? Styles["open"] : Styles["close"]}`}>
        <div>
                <h1>{title}</h1>
            </div>
            <div style={{ alignSelf: "flex-end", padding: "6px" }}>
                <button className={"icon-close"} onClick={() => onCloseModal()}></button>
            </div>
            <div style={{ width: "95%" }}>
                {children}
            </div>
    </div>
};

export default BaseModal;