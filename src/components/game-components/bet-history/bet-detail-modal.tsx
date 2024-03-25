import { FC, ReactNode } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { createPortal } from "react-dom";

const BetDetailModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { isShowBetDetail } = useGameStateContext();
    const { t: translateCommon } = useCommonTranslate();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: GameEventActionType.TOGGLE_BET_DETAIL, payload: { isShowBetDetail: false } });
    };

    return (
        isShowBetDetail &&
        createPortal(
            <ModalContainer
                id="bet-detail"
                title={translateCommon("bet_detail")}
                isOpen={true}
                onCloseModal={handleCloseModal}
                isOverlap={true}
            >
                {children}
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

export default BetDetailModal;
