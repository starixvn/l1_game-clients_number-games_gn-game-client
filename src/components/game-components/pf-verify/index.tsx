import { FC, useEffect } from "react";
import ModalContainer from "../modal-container";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { useGameContext } from "../../../_shared/react-contexts";
import { createPortal } from "react-dom";
import Styles from "../pf-setting/pf-setting.module.scss";
import { useBallColor } from "../../../_shared/helpers/ball-color-helper";

const PFVerifyModal: FC<{ handleCloseModal: Function; isShowPFVerify: boolean; drawId: number }> = ({
    handleCloseModal,
    isShowPFVerify,
    drawId,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isShowPFVerify &&
        createPortal(
            <ModalContainer
                title={translateCommon("pf_title_provably_fair_settings")}
                isOpen={isShowPFVerify}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify drawId={drawId} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerify: FC<{ drawId: number }> = () => {
    const { gameName } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateBacBall } = useTranslator([gameName]);
    const { gameMessageHandler } = useGameContext();
    const ballColor = useBallColor;

    return (
        <div className={Styles["pf-setting-container"]}>
            <button className={Styles["btn-pf-guide"]}>
                <span className="icon-guide" />
            </button>
            <div className="text-white font-weight-medium mb-2">{translateSNGames("glossary_draw_id")}: #1234 (3rd Draw)</div>
            <div className="flex justify-around">
                <div className="text-center">
                    <div className="text-white font-weight-medium text-uppercase">{translateBacBall("glossary_player")}</div>
                    <div className={Styles["balls-container"]}>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 16 })]}`}>16</span>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 54 })]}`}>54</span>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 35 })]}`}>35</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-white font-weight-medium text-uppercase">{translateBacBall("glossary_banker")}</div>
                    <div className={Styles["balls-container"]}>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 41 })]}`}>4</span>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 8 })]}`}>8</span>
                        <span className={`${Styles["ball"]} ${Styles[ballColor({ number: 12 })]}`}>12</span>
                    </div>
                </div>
            </div>

            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_server_seed_sha256")}</h3>
                <div className={Styles["server-seed-field"]}>
                    <input className={Styles["server-seed-hash"]} type="text" name="" id="" />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>

                <h3 className={`${Styles["section-title"]} mt-3`}>{translateCommon("pf_header_server_seed")}</h3>
                <div className={Styles["server-seed-field"]}>
                    <input className={Styles["server-seed-hash"]} type="text" name="" id="" />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>
            </div>
            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_client_seed")}</h3>
                <div className={Styles["tooltip-container"]}>
                    <button className={Styles["btn-pf-intro"]}>
                        <span className="icon-info" />
                    </button>
                    <div className={Styles["pf-tooltip"]}>
                        Client seed is generated from Player’s side. Merge client seeds of all betting players in sequential order from the
                        first player to the last one without any space.
                    </div>
                </div>

                <div className="relative">
                    <h3 className={Styles["section-title"]}>{translateCommon("pf_ header_merge_client_seed")}</h3>
                    <a className={Styles["link-detail"]} href="#">
                        Details
                    </a>
                </div>
                <div className={Styles["server-seed-field"]}>
                    <input className={Styles["server-seed-hash"]} type="text" name="" id="" />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>
            </div>
            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                <div className={Styles["tooltip-container"]}>
                    <button className={Styles["btn-pf-intro"]}>
                        <span className="icon-info" />
                    </button>
                </div>

                <div className={`${Styles["server-seed-field"]} mt-4`}>
                    <input className={Styles["server-seed-hash"]} type="text" name="" id="" />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>
            </div>

            <button className={`btn-green ${Styles["btn-verify"]}`}>{translateCommon("pf_verify")}</button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

export default PFVerifyModal;
