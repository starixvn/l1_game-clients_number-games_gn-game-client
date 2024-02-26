import { useTranslate } from "@tolgee/react";
import React, { useEffect } from "react";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import "../../../_shared/helpers/string-helper";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
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
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration * 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
            <div className={`modal-center red-color`}>
                <span className={`icon-close ${Styles["icon-close"]}`} onClick={onClose} data-testid="close-btn"></span>
                {children}
            </div>
        </BaseDialog>
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
    const { t } = useTranslate(["Common", "SabaNumber"]);

    const opt = {
        gameName: gameName,
        roundId: roundId,
        gameRoundId: roundId,
        minBet: numberWithCommas(+minBet),
        maxBet: numberWithCommas(+maxBet),
        errorCode: errorCode,
        betChoice1,
        betChoice2,
    };

    return (
        <BaseNotice {...{ onClose, duration, isWarning }}>
            <div className={Styles["notice-content"]}>
                {t({
                    key: message,
                    params: opt,
                    noWrap: true,
                }).replaceTolgeeFormat()}
            </div>
        </BaseNotice>
    );
};
