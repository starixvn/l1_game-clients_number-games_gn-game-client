import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useCommonTranslate } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";

const PFVerifyDetailModal: FC<{ handleCloseModal: Function; isOpen: boolean; children: ReactNode }> = ({
    handleCloseModal,
    isOpen,
    children,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isOpen &&
        createPortal(
            <ModalContainer
                id="pf-verify-detail-modal"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_verification").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isOpen}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                {children}
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

export default PFVerifyDetailModal;
