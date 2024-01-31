import React, { useEffect, useRef } from "react";
import { isMobileOnly, isIOS } from "react-device-detect";

import Styles from "./base-dialog.module.scss";
import { ModalType } from "./type";

const HeaderHeightInPixel = 55;

type Props = {
    isOpen?: boolean;
    onCloseModal?: Function;
    children?: React.ReactNode;
    type?: ModalType;
    betContainerPosition?: number;
    enableBackdrop?: boolean;
    toggleBtnRef?: React.MutableRefObject<HTMLElement>;
    isBlockUI?: boolean;
};

const getClassFollowDevice = () => {
    if (isMobileOnly) {
        return isIOS ? Styles["ios-device"] : Styles["android-device"];
    }
    return "";
};

const getCustomStyle = ({ betContainerPosition }) => {
    const browserHeight = window.innerHeight;

    if (betContainerPosition != null) {
        return browserHeight / betContainerPosition > 2
            ? { top: `${betContainerPosition}px` }
            : { bottom: `${browserHeight - betContainerPosition + HeaderHeightInPixel}px`, top: "auto" };
    }

    return {};
};

const BaseDialog: React.FC<Props> = ({
    children,
    onCloseModal = null,
    isOpen = true,
    type = ModalType.Full,
    betContainerPosition,
    enableBackdrop,
    toggleBtnRef,
    isBlockUI,
}: Props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const classModal = `modal-${ModalType[type].toLocaleLowerCase()}`;

    useEffect(() => {
        if (enableBackdrop) {
            document.body.classList.add("no-scroll");
            isMobileOnly && document.documentElement.classList.add("no-scroll-html");
        }

        return () => {
            if (enableBackdrop) {
                document.body.classList.remove("no-scroll");
                isMobileOnly && document.documentElement.classList.remove("no-scroll-html");
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (isOpen && !wrapperRef?.current?.contains(event.target) && !toggleBtnRef?.current?.contains(event.target)) {
                onCloseModal && onCloseModal();
            }
        };
        !isBlockUI && document.addEventListener("mousedown", handleClickOutside);
        return () => {
            !isBlockUI && document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <>
            {enableBackdrop && !isMobileOnly && <div className={`overlay-mask ${Styles["overlay"]}`}></div>}
            <div
                style={getCustomStyle({ betContainerPosition })}
                ref={wrapperRef}
                className={`${Styles.popup} ${Styles[classModal]} ${isMobileOnly ? Styles["isMobile"] : ""} ${getClassFollowDevice()}`}
            >
                {children}
            </div>
        </>
    );
};

export default BaseDialog;
