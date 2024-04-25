import React, { useEffect, useState } from "react";
import { createOptionForHedgeBetGroup, getExtendMessageByErrorCode } from "../../../_shared/helpers";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import { useGameContext } from "../../../_shared/react-contexts";
import { useClickSound, useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./notice.module.scss";
import { NoticeModel } from "../../game-base/type";
import { GlobalMessageTransmitter, registerGlobalMessageEvent } from "../../../_shared/helpers/message-transmitter/global-transmitter";

const BaseNotice: React.FC<{
    onClose: () => void;
    duration: number;
    isOpen?: boolean;
    isWarning: boolean;
    children: React.ReactNode
}> = ({
    children,
    onClose,
    duration = 3,
}) => {
        useEffect(() => {
            const timer = setTimeout(onClose, duration * 1000);

            return () => clearTimeout(timer);
        }, []);
        const clickSound = useClickSound();

        return (
            <BaseDialog type={ModalType.Center} isOpen={true} onCloseModal={onClose}>
                <div className={`modal-center red-color`}>
                    <span
                        className={`icon-close ${Styles["icon-close"]}`}
                        onClick={() => {
                            clickSound();
                            onClose();
                        }}
                        data-testid="close-btn"
                    ></span>
                    {children}
                </div>
            </BaseDialog>
        );
    };

export const NoticeDialog = () => {
    const { t } = useTranslator();
    const { tolgeeNamespace } = useGameContext();
    const [notice, setNotice] = useState<NoticeModel>(null);

    useEffect(() => {
        registerGlobalMessageEvent("notice", ({ notice }) => {
            setNotice(notice);
        });

        return () => {
            GlobalMessageTransmitter.clearAllListener();
        }
    }, []);

    if (notice) {
        const {
            gameName,
            message,
            roundId,
            duration,
            minBet,
            maxBet,
            errorCode,
            isWarning,
            betChoice1,
            betChoice2,
            onClose,
            hedgeBetGroup,
        } = notice;

        const closeNotice = () => { setNotice(null) };

        const onCloseNotice = onClose || (() => closeNotice());
        let hedgeBet = {};
        if (hedgeBetGroup) {
            hedgeBet = createOptionForHedgeBetGroup(hedgeBetGroup, tolgeeNamespace);
        }

        const params = {
            gameName,
            roundId,
            gameRoundId: roundId,
            minBet: numberWithCommas(+minBet),
            maxBet: numberWithCommas(+maxBet),
            errorCode: errorCode,
            betChoice1,
            betChoice2,
            ...hedgeBet,
        };

        return (
            <BaseNotice {...{ onClose: onCloseNotice, duration, isWarning }}>
                <div className={Styles["notice-content"]}>
                    {t(`${message}`, params, { noWrap: true }).replaceTolgeeFormat()}
                    {getExtendMessageByErrorCode(errorCode)}
                </div>
            </BaseNotice>
        );
    }

    return <></>;
};
