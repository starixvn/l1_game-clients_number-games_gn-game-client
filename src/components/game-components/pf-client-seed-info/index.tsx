import { FC } from "react";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import { createPortal } from "react-dom";
import ModalContainer from "../modal-container";
import Styles from "../pf-setting/pf-setting.module.scss";
import { useGameContext } from "../../../_shared/react-contexts";

const PFClientSeedInfoModal: FC<{ handleCloseModal: Function; isShowPFClientSeedInfo: boolean; clientSeedInfo: any[] }> = ({
    handleCloseModal,
    isShowPFClientSeedInfo,
    clientSeedInfo,
}) => {
    const { gameName } = useGameContext();
    const { t: translateBacBall } = useTranslator([gameName]);

    return (
        isShowPFClientSeedInfo &&
        createPortal(
            <ModalContainer
                id="pf-client-seed-info-modal"
                title={
                    <div>
                        <button className={Styles["btn-pf-guide"]}>
                            <span className="icon-guide" />
                        </button>
                        {translateBacBall("pf_title_client_seed_info")}
                    </div>
                }
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
    const { gameName } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateBacBall } = useTranslator([gameName]);

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className={Styles["client-seed-form"]}>
                <div className="flex items-center justify-between">
                    <h3 className={`${Styles["section-title"]} m-0`}>{translateCommon("pf_new_client_seed_para_1")}</h3>
                    <div className="input-group width-small">
                        <input className="form-control" type="text" readOnly value="1234" />
                        <button className={Styles["copy-btn"]}>
                            <span className="icon-copy" />
                        </button>
                    </div>
                </div>
                <h3 className={`${Styles["section-title"]} mt-3`}>{translateCommon("pf_ header_merge_client_seed")}</h3>

                <div className="input-group width-full">
                    <input className="form-control" type="text" name="" id="" readOnly />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>
            </div>
            <div className="form">
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`${Styles["section-title"]} m-0`}>
                        {translateBacBall("pf_client_seed_info_total_players")} <span className={Styles["text-highlight"]}>150</span>
                    </h3>
                    <button className={Styles["btn-export"]}>
                        <span className="icon-file-csv">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                        </span>
                    </button>
                </div>
                <div className={`table-container react-infinite-table ${Styles["pf-info"]}`}>
                    <table className={`table text-center ${Styles["table"]}`}>
                        <thead>
                            <tr>
                                <th>{translateBacBall("glossary_player")}</th>
                                <th>{translateCommon("character_name")}</th>
                                <th>{translateBacBall("pf_client_seed_info_subtitle_seed")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>John</td>
                                <td>123</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>John</td>
                                <td>123</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td className={Styles["table-highlight"]}>John</td>
                                <td className={Styles["table-highlight"]}>123</td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>John</td>
                                <td>123</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PFClientSeedInfoModal;
