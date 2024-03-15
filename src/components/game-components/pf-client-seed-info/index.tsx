import { FC } from "react";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { createPortal } from "react-dom";
import ModalContainer from "../modal-container";

const PFClientSeedInfoModal: FC<{ handleCloseModal: Function; isShowPFClientSeedInfo: boolean; clientSeedInfo: any[] }> = ({
    handleCloseModal,
    isShowPFClientSeedInfo,
    clientSeedInfo,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isShowPFClientSeedInfo &&
        createPortal(
            <ModalContainer
                id="pf-client-seed-info-modal"
                title={translateCommon("pf_header_client_seed_info")}
                isOpen={isShowPFClientSeedInfo}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFClientSeedInfo clientSeedInfo={clientSeedInfo} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFClientSeedInfo: FC<{ clientSeedInfo: any[] }> = ({ clientSeedInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    return (
        <div>
            <div className="form">
                <div className="field">
                    <div className="item">{translateCommon("pf_new_client_seed_para_1")}</div>
                    <div className="item">
                        <input type="text" />
                        <button>Copy</button>
                    </div>
                </div>

                <div className="field">
                    <div className="item">{translateCommon("pf_ header_merge_client_seed")}</div>
                    <div className="item">
                        <input type="text" />
                        <button>Copy</button>
                    </div>
                </div>
            </div>
            <div className="form">
                <div className="header">
                    <div className="item">{translateCommon("pf_totals_player")}: 150</div>
                    <button>CSV</button>
                </div>
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>{translateCommon("pf_player")}</th>
                                <th>{translateCommon("pf_nick_name")}</th>
                                <th>{translateCommon("pf_seed")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PFClientSeedInfoModal;
