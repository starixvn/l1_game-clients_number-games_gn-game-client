import { FC, ReactNode } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { createPortal } from "react-dom";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

const BetHistoryModalBase: FC<{ children: ReactNode }> = ({ children }) => {
    const { isShowBetHistory } = useGameStateContext();
    const { t: translateCommon } = useCommonTranslate();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: GameEventActionType.TOGGLE_BET_HISTORY, payload: { isShowBetHistory: false } });
    };
    return (
        isShowBetHistory &&
        createPortal(
            <ModalContainer id="bet-history" title={translateCommon("bet_history")} isOpen={true} onCloseModal={handleCloseModal}>
                {children}
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

export default BetHistoryModalBase;
