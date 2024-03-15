import { FC, useMemo, useState } from "react";
import ModalContainer from "../modal-container";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { useGameContext } from "../../../_shared/react-contexts";
import { createPortal } from "react-dom";
import Styles from "../pf-setting/pf-setting.module.scss";
import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import { PFResult } from "../../game-base/type";
import { getOrdinalNumber } from "../../../_shared/helpers";
import { v4 as uuidv4 } from "uuid";
import PFClientSeedInfoModal from "../pf-client-seed-info";

const PFVerifyModal: FC<{ handleCloseModal: Function; isShowPFVerify: boolean; pfResult: PFResult }> = ({
    handleCloseModal,
    isShowPFVerify,
    pfResult,
}) => {
    const { t: translateCommon } = useCommonTranslate();
    const [isShowClientSeedInfo, setIsShowClientSeedInfo] = useState(false);

    const handleOpenClientSeedInfo = () => {
        setIsShowClientSeedInfo(true);
    };

    const handleCloseClientSeedInfo = () => {
        setIsShowClientSeedInfo(false);
    };

    return (
        isShowPFVerify &&
        createPortal(
            <ModalContainer
                title={translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
                isOpen={isShowPFVerify && !isShowClientSeedInfo}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify pfResult={pfResult} handleOpenClientSeedInfo={handleOpenClientSeedInfo} />
                <PFClientSeedInfoModal
                    handleCloseModal={handleCloseClientSeedInfo}
                    isShowPFClientSeedInfo={isShowClientSeedInfo}
                    clientSeedInfo={pfResult?.clientSeeds}
                />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerify: FC<{ pfResult: PFResult; handleOpenClientSeedInfo: Function }> = ({ pfResult, handleOpenClientSeedInfo }) => {
    const { gameName } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateBacBall } = useTranslator([gameName]);
    const drawResult = useMemo(() => {
        const beforeDrawResult = [];
        for (const item of pfResult?.roundResult || []) {
            beforeDrawResult.push(item);
            if (item?.drawId == pfResult?.drawId) {
                break;
            }
        }

        return {
            drawID: pfResult?.drawId,
            order: getOrdinalNumber(beforeDrawResult.length),
            result: beforeDrawResult,
        };
    }, [pfResult]);
    const ballColor = useBallColor;
    const handleClickClientSeedInfo = () => {
        handleOpenClientSeedInfo();
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <button className={Styles["btn-pf-guide"]}>
                <span className="icon-guide" />
            </button>
            <div className="text-white font-weight-medium mb-2">
                {translateSNGames("glossary_draw_id")}: #{drawResult?.drawID} ({drawResult?.order} Draw)
            </div>
            <div className="flex justify-around">
                {useMemo(() => {
                    return ["player", "banker"].map((item) => {
                        return (
                            <div className="text-center" key={uuidv4()}>
                                <div className="text-white font-weight-medium text-uppercase">{translateBacBall(`glossary_${item}`)}</div>
                                <div className={Styles["balls-container"]}>
                                    {drawResult.result.map((child, index) => (
                                        <span key={uuidv4()} className={`${Styles["ball"]} ${Styles[ballColor({ number: child[item] })]}`}>
                                            {child[item]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    });
                }, [drawResult])}
            </div>

            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_server_seed_sha256")}</h3>
                <div className="input-group width-full">
                    <input className="form-control" type="text" name="" id="" readOnly value={pfResult?.serverSeedHash} />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>

                <h3 className={`${Styles["section-title"]} mt-3`}>{translateCommon("pf_header_server_seed")}</h3>
                <div className="input-group width-full">
                    <input className="form-control" type="text" name="" id="" readOnly value={pfResult?.mergeSeed} />
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
                        {translateCommon("pf_client_seed_tooltip_para_1")} <br /> {translateCommon("pf_client_seed_tooltip_para_2")}
                    </div>
                </div>

                <div className="relative">
                    <h3 className={Styles["section-title"]}>{translateCommon("pf_ header_merge_client_seed")}</h3>
                    <span className={Styles["link-detail"]} onClick={handleClickClientSeedInfo}>
                        Details
                    </span>
                </div>
                <div className="input-group width-full">
                    <input className="form-control" type="text" name="" id="" readOnly value={pfResult?.mergeSeed} />
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

                <div className="input-group width-full mt-4">
                    <input className="form-control" type="text" name="" id="" readOnly value={pfResult?.finalHash} />
                    <button className={Styles["copy-btn"]}>
                        <span className="icon-copy" />
                    </button>
                </div>
            </div>

            <button className={`btn-green ${Styles["btn-verify"]}`}>{translateCommon("pf_button_verify")}</button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

export default PFVerifyModal;
