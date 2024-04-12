import { FC, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCommonTranslate } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";

const PFVerificationModal: FC<{ children: ReactNode }> = ({ children }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowPFVerification, pfVerifyModalData } = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: GameEventActionType.TOGGLE_PF_VERIFICATION, payload: { isShowPFVerification: false } });
    };

    useEffect(() => {
        if (!isShowPFVerification) {
            dispatch({
                type: GameEventActionType.UPDATE_PF_VERIFY,
                payload: {
                    pfVerifyModalData: {
                        ...pfVerifyModalData,
                        editedMergeClientSeed: null,
                    },
                },
            });
        }
    }, [isShowPFVerification]);

    return (
        isShowPFVerification &&
        createPortal(
            <ModalContainer
                id="pf-verify-detail-modal"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_verification").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isShowPFVerification}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                {children}
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

export default PFVerificationModal;
