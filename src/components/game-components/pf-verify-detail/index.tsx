import { FC } from "react";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { createPortal } from "react-dom";
import ModalContainer from "../modal-container";
import Styles from "../pf-setting/pf-setting.module.scss";

const PFVerifyDetailModal: FC<{ handleCloseModal: Function; isOpen: boolean; data?: any }> = ({
    handleCloseModal,
    isOpen: isOpen,
    data,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isOpen &&
        createPortal(
            <ModalContainer
                id="pf-verify-detail-modal"
                title={
                    <div>
                        <button className={Styles["btn-pf-guide"]}>
                            <span className="icon-guide" />
                        </button>
                        {translateCommon("pf_title_verification").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isOpen}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                {" "}
                <PFVerifyDetail />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerifyDetail: FC = () => {
    const { t: translateCommon } = useCommonTranslate();
    return (
        <div className="container">
            <div className="form-group">
                <div className="item">
                    <label htmlFor="">{translateCommon("pf_ header_merge_client_seed")}</label>
                    <div className="field">
                        <input type="text" name="" id="" />
                    </div>
                </div>
                <div className="item">
                    <label htmlFor="">{translateCommon("pf_header_server_seed")}</label>
                    <div className="field">
                        <input type="text" name="" id="" />
                    </div>
                </div>
                <div className="item">
                    <label htmlFor="">{translateCommon("pf_header_combined_sha512_hash")}</label>
                    <div className="field">
                        <input type="text" name="" id="" />
                    </div>
                    <span className="verify"></span>
                </div>
            </div>
            <div className="form-group"></div>
        </div>
    );
};

export default PFVerifyDetailModal;
