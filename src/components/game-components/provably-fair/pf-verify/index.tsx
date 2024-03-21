import { Dispatch, FC, useMemo, useReducer } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { getGlossaryTranslate, getOrdinalNumber } from "../../../../_shared/helpers";
import { useBallColor } from "../../../../_shared/helpers/ball-color-helper";
import { useGameContext } from "../../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate, useSNTranslate, useTranslator } from "../../../../_shared/react-hooks";
import { PFResult } from "../../../game-base/type";
import ModalContainer from "../../modal-container";
import PFClientSeedInfoModal from "./pf-client-seed-info";
import { ButtonPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import PFVerifyDetailModal from "./pf-verify-detail";
import CopyableTextInput from "../copyable-text-input";

enum PFDispatchAction {
    OPEN_CLIENT_SEED_INFO = "openClientSeedInfo",
    CLOSE_CLIENT_SEED_INFO = "closeClientSeedInfo",
    OPEN_PF_VERIFY_DETAIL = "openPFVerifyDetail",
    CLOSE_PF_VERIFY_DETAIL = "closePFVerifyDetail",
}

interface PFChildModalState {
    isShowClientSeedInfo: boolean;
    isShowPFVerifyDetail: boolean;
}

const PFVerifyModal: FC<{ handleCloseModal: Function; isShowPFVerify: boolean; pfResult: PFResult }> = ({
    handleCloseModal,
    isShowPFVerify,
    pfResult,
}) => {
    const { t: translateCommon } = useCommonTranslate();

    const reducer = (state: PFChildModalState, action: PFDispatchAction) => {
        switch (action) {
            case PFDispatchAction.OPEN_CLIENT_SEED_INFO:
                return {
                    ...state,
                    isShowClientSeedInfo: true,
                };
            case PFDispatchAction.CLOSE_CLIENT_SEED_INFO:
                return {
                    ...state,
                    isShowClientSeedInfo: false,
                };
            case PFDispatchAction.OPEN_PF_VERIFY_DETAIL:
                return {
                    ...state,
                    isShowPFVerifyDetail: true,
                };
            case PFDispatchAction.CLOSE_PF_VERIFY_DETAIL:
                return {
                    ...state,
                    isShowPFVerifyDetail: false,
                };
            default:
                return state;
        }
    };

    const [childeModalState, dispatch] = useReducer(reducer, {
        isShowClientSeedInfo: false,
        isShowPFVerifyDetail: false,
    });

    return (
        isShowPFVerify &&
        createPortal(
            <ModalContainer
                id="pf-verify"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isShowPFVerify && !childeModalState.isShowClientSeedInfo && !childeModalState.isShowPFVerifyDetail}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify pfResult={pfResult} dispatchChildModalState={dispatch} />
                <PFClientSeedInfoModal
                    handleCloseModal={() => dispatch(PFDispatchAction.CLOSE_CLIENT_SEED_INFO)}
                    isShowPFClientSeedInfo={childeModalState.isShowClientSeedInfo}
                    clientSeedInfo={pfResult}
                />
                <PFVerifyDetailModal
                    isOpen={childeModalState.isShowPFVerifyDetail}
                    handleCloseModal={() => dispatch(PFDispatchAction.CLOSE_PF_VERIFY_DETAIL)}
                    pfResult={pfResult}
                />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerify: FC<{ pfResult: PFResult; dispatchChildModalState: Dispatch<PFDispatchAction> }> = ({
    pfResult,
    dispatchChildModalState: dispatch,
}) => {
    const { tolgeeNamespace } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const { t: translateBacBall } = useTranslator([tolgeeNamespace]);
    const clickSound = useClickSound();

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
            order: translateSNGames(`draw_${beforeDrawResult.length}`)?.replace(":", ""),
            result: beforeDrawResult,
        };
    }, [pfResult]);
    const ballColor = useBallColor;

    const handleClickTooltip = (event: React.MouseEvent<HTMLButtonElement> & React.FocusEvent<HTMLButtonElement>) => {
        clickSound();
        const currentTarget = event.currentTarget as HTMLElement;
        const tooltip = currentTarget.nextElementSibling as HTMLDivElement;
        tooltip.classList.toggle(Styles["hide"]);
    };

    const handleBlurTooltip = (event: React.FocusEvent<HTMLButtonElement>) => {
        const currentTarget = event.currentTarget as HTMLElement;
        const tooltip = currentTarget.nextElementSibling as HTMLDivElement;
        tooltip.classList.add(Styles["hide"]);
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className="text-white font-weight-medium mb-2">
                {translateSNGames("glossary_draw_id")}: #{drawResult?.drawID} ({drawResult?.order})
            </div>
            <div className="flex justify-around">
                {useMemo(() => {
                    return ["player", "banker"].map((item) => {
                        return (
                            <div className="text-center" key={uuidv4()}>
                                <div className="text-white font-weight-medium text-uppercase">
                                    {translateBacBall(getGlossaryTranslate(tolgeeNamespace, item))}
                                </div>
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
                    <CopyableTextInput value={pfResult?.serverSeedHash} id="server-seed-sha256" />
                </div>

                <h3 className={`${Styles["section-title"]} mt-3`}>{translateCommon("pf_header_server_seed")}</h3>
                <div className="input-group width-full">
                    <CopyableTextInput value={pfResult?.serverSeed} id="server-seed" />
                </div>
            </div>
            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_client_seed")}</h3>
                <div className={Styles["tooltip-container"]}>
                    <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} onBlur={handleBlurTooltip}>
                        <span className="icon-info" />
                    </button>
                    <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]} break`}>{translateBacBall("pf_client_seed_tooltip")}</div>
                </div>

                <div className="relative">
                    <h3 className={Styles["section-title"]}>{translateCommon("pf_ header_merge_client_seed")}</h3>
                    <span
                        className={Styles["link-detail"]}
                        onClick={() => {
                            clickSound();
                            dispatch(PFDispatchAction.OPEN_CLIENT_SEED_INFO);
                        }}
                    >
                        {translateBacBall("pf_provably_fair_details")}
                    </span>
                </div>
                <div className="input-group width-full">
                    <CopyableTextInput value={pfResult?.mergeClientSeed} id="merge-client-seed" />
                </div>
            </div>
            <div className={Styles["client-seed-form"]}>
                <h3 className={Styles["section-title"]}>{translateCommon("pf_header_combined_sha512_hash")}</h3>
                <div className={Styles["tooltip-container"]}>
                    <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} onBlur={handleBlurTooltip}>
                        <span className="icon-info" />
                    </button>
                    <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]}`}>{translateBacBall("pf_combined_sha512_hash_tooltip")}</div>
                </div>

                <div className="input-group width-full mt-4">
                    <CopyableTextInput value={pfResult?.finalHash} id="combined-sha512-hash" />
                </div>
            </div>

            <button
                className={`btn-green ${Styles["btn-verify"]}`}
                onClick={() => {
                    clickSound();
                    dispatch(PFDispatchAction.OPEN_PF_VERIFY_DETAIL);
                }}
            >
                {translateCommon("pf_button_verify")}
            </button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

export default PFVerifyModal;
