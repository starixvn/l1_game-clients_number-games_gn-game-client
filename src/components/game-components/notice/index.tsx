import React, { useEffect } from "react";
import { createOptionForHedgeBetGroup, getExtendMessageByErrorCode } from "../../../_shared/helpers";
import { numberWithCommas } from "../../../_shared/helpers/number-helper";
import { useGameContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useTranslator } from "../../../_shared/react-hooks";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import Styles from "./notice.module.scss";

const BaseNotice: React.FC<{ onClose: () => void; duration: number; isOpen?: boolean; isWarning: boolean; children: React.ReactNode }> = ({
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

export const Notice = () => {
    const { t } = useTranslator();
    const gameStateContext = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();
    const dispatch = useGameStatesDispatch();

    if (gameStateContext.notice) {
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
        } = gameStateContext.notice;

        const closeNotice = () => {
            dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: null,
                },
            });
        };

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
