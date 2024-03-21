import { FC } from "react";
import { createPortal } from "react-dom";
import { useBallColor } from "../../../../../_shared/helpers/ball-color-helper";
import { useGameContext } from "../../../../../_shared/react-contexts";
import { useCommonTranslate, useTranslator } from "../../../../../_shared/react-hooks";
import ModalContainer from "../../../modal-container";
import { ButtonPFGuide } from "../../pf-guide";

import Styles from "../../provably-fair.module.scss";
import { PFResult } from "../../../../game-base/type";

const PFVerifyDetailModal: FC<{ handleCloseModal: Function; isOpen: boolean; pfResult: PFResult }> = ({
    handleCloseModal,
    isOpen,
    pfResult,
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
                <PFVerifyDetail pfResult={pfResult} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerifyDetail: FC<{ pfResult: PFResult }> = () => {
    const { tolgeeNamespace } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateBacBall } = useTranslator([tolgeeNamespace]);
    const ballColor = useBallColor;
    return (
        <div className={Styles["pf-setting-container"]}>
            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_ header_merge_client_seed")}</h3>
            <div className="input-group width-full mb-3">
                <input className="form-control" type="text" name="" id="" readOnly />
                <button className={Styles["copy-btn"]}>
                    <span className="icon-edit" />
                </button>
            </div>

            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_header_server_seed")}</h3>
            <div className="input-group width-full mb-3">
                <input className="form-control" type="text" name="" id="" readOnly />
                <button className={Styles["copy-btn"]}>
                    <span className="icon-copy" />
                </button>
            </div>

            <h3 className={`${Styles["section-title"]}`}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
            <p className="text-wrap"></p>
            <p className={Styles["text-successful"]}>{translateBacBall("pf_verification_msg_verify_successful")}</p>
            <p className={Styles["text-unsuccessful"]}>{translateBacBall("pf_verification_msg_verify_unsuccessful")}</p>

            <div className={Styles["client-seed-form"]}>
                <div className="flex justify-between items-center">
                    <h3 className={`${Styles["section-title"]} m-0 ${Styles["title-fix-width"]}`}>
                        {translateCommon("pf_verification_para_1")}
                    </h3>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-uppercase font-weight-medium text-white">{translateBacBall("glossary_player")}</span>
                            <div className={`${Styles["ball"]} ${Styles[ballColor({ number: 39 })]}`}>{39}</div>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-uppercase font-weight-medium text-white">{translateBacBall("glossary_banker")}</span>
                            <div className={`${Styles["ball"]} ${Styles[ballColor({ number: 70 })]}`}>{70}</div>
                        </div>
                    </div>
                </div>
                <h3 className={`${Styles["section-title"]} mt-2`}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                <p className="text-wrap">
                    4eb1ec458c6001e7c12fe3ef534794cb3b0f670596b1c6e1a643106a9d9bfa61a0064838dec0db10d3e9f8b2676be9c41fe9ffa0d6abed796d02aef4b7af968d
                </p>

                <h3 className={`${Styles["section-title"]}`}>{translateBacBall("pf_verification_para_3")}</h3>
                <p className="font-weight-medium">4e {"=>"} 78</p>
                <p>
                    <span className={Styles["text-highlight"]}>{translateBacBall("pf_verification_para_4")}</span>
                    <span> = ((Random number + X) mod Number of balls left) + 1</span>
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>{translateBacBall("pf_verification_para_6")} (1,..., 75)</span> = ((15 + 78)
                    mod 75) + 1 = <span className={Styles["text-highlight"]}>19</span>
                </p>
                <p>
                    <span className={Styles["text-highlight"]}>{translateBacBall("pf_verification_para_7")} (1,..., 75)</span> = ((40 + 78)
                    mod 75) + 1 = <span className={Styles["text-highlight"]}>44</span>
                </p>

                <h3 className={`${Styles["section-title"]}`}>{translateBacBall("pf_verification_para_8")}</h3>
                <h3 className={`${Styles["section-title"]}`}>{translateBacBall("pf_verification_para_9")}</h3>
                <p className={Styles["result-numbers"]}>
                    1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 <span className={Styles["text-yellow"]}>19</span> 20 21 22 23 24 25 26 27
                    28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67
                    68 69 70 71 72 73 74 75
                </p>

                <h3 className={`${Styles["section-title"]}`}>{translateBacBall("pf_verification_para_10")}</h3>
                <p className={Styles["result-numbers"]}>
                    1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43{" "}
                    <span className={Styles["text-yellow"]}>44</span> 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67
                    68 69 70 71 72 73 74 75
                </p>
            </div>
        </div>
    );
};

export default PFVerifyDetailModal;
