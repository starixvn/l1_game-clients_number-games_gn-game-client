import { useTranslate } from "@tolgee/react";
import React, { useEffect } from "react";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./notice.module.scss";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

const BaseNotice: React.FC<{ onClose: () => void; duration: number; isOpen?: boolean; isWarning: boolean; children: React.ReactNode }> = ({
    children,
    onClose,
    duration = 3,
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

export const Notice = () => {
    const { t } = useTranslate(["Common", "SabaNumber"]);
    const gameStateContext = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    if (gameStateContext.notice) {
        const { gameName, message, roundId, duration, minBet, maxBet, errorCode, isWarning, betChoice1, betChoice2, onClose } =
            gameStateContext.notice;

        const closeNotice = () => {
            dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: null,
                },
            });
        };

        const onCloseNotice = onClose || (() => closeNotice());

        const opt = {
            gameName,
            roundId,
            gameRoundId: roundId,
            minBet: numberWithCommas(+minBet),
            maxBet: numberWithCommas(+maxBet),
            errorCode: errorCode,
            betChoice1,
            betChoice2,
        };

        return (
            <BaseNotice {...{ onClose: onCloseNotice, duration, isWarning }}>
                <div className={Styles["notice-content"]}>
                    {t({
                        key: message,
                        params: opt,
                        noWrap: true,
                    }).replaceTolgeeFormat()}
                </div>
            </BaseNotice>
        );
    }

    return <></>;
};
