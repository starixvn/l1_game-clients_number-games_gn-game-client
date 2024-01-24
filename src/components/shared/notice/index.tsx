import React, { useEffect, useRef } from "react";
import { useTranslation, Trans } from "next-i18next";
import { numberWithCommas } from "../../../helpers/number-helper";
import Styles from "./notice.module.scss";
interface Props {
    gameName?: string;
    roundId?: number;
    message: string;
    onClose?: () => void;
    duration: number;
    minBet?: number;
    maxBet?: number;
    errorCode?: string;
    isWarning?: boolean;
    betChoice1?: string;
    betChoice2?: string;
}

const BaseNotice: React.FC<{ onClose: () => void; duration: number; isOpen?: boolean; isWarning: boolean; children: React.ReactNode }> = ({
    children,
    onClose,
    duration,
    isOpen = true,
    isWarning = true,
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(onClose, duration * 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (isOpen && wrapperRef && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                onClose && onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const noticeType = Styles[isWarning ? "warning" : "inform"];
    return (
        <div ref={wrapperRef} className={`${Styles.notice} ${noticeType}`}>
            <span className={`icon-close ${Styles["icon-close"]}`} onClick={onClose} data-testid="close-btn"></span>
            {children}
        </div>
    );
};

export const Notice: React.FC<Props> = ({
    message,
    onClose,
    duration = 3,
    minBet = 0,
    maxBet = 0,
    gameName,
    roundId = 0,
    betChoice1,
    betChoice2,
    errorCode,
    isWarning = true,
}) => {
    const { t } = useTranslation();
    const opt = {
        gameName: gameName,
        roundId: roundId,
        minBet: numberWithCommas(+minBet),
        maxBet: numberWithCommas(+maxBet),
        errorCode: errorCode,
        betChoice1,
        betChoice2,
    };

    return (
        <BaseNotice {...{ onClose, duration, isWarning }}>
            <Trans t={t}>{t(message, opt)}</Trans>
        </BaseNotice>
    );
};
