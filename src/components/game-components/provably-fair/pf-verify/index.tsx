import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useGameContext } from "../../../../_shared/react-contexts";
import { useClickSound, useCommonTranslate, useTranslator } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import CopyableTextInput from "../copyable-text-input";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";

const PFVerifyModal: FC<{
    renderResultBlock: Function;
    pfVerify: ReactNode;
}> = ({ renderResultBlock }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowPFVerify } = useGameStateContext();
    const gameStateDispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        gameStateDispatch({
            type: GameEventActionType.TOGGLE_PF_VERIFY,
            payload: { isShowPFVerify: false },
        });
    };

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
                isOpen={isShowPFVerify}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify renderResultBlock={renderResultBlock} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const PFVerify: FC<{ renderResultBlock: Function }> = ({ renderResultBlock }) => {
    const { pfVerifyModalData: pfResult } = useGameStateContext();
    const { tolgeeNamespace } = useGameContext();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateInGame } = useTranslator([tolgeeNamespace]);
    const clickSound = useClickSound();
    const dispatch = useGameStatesDispatch();

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

    const handleOnClickClientSeedInfo = () => {
        clickSound();
        dispatch({ type: GameEventActionType.TOGGLE_PF_CLIENT_SEED_INFO, payload: { isShowPFClientSeedInfo: true } });
    };

    const handleOnClickVerification = () => {
        clickSound();
        dispatch({ type: GameEventActionType.TOGGLE_PF_VERIFICATION, payload: { isShowPFVerification: true } });
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className="result-block">{renderResultBlock(pfResult)}</div>

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
                    <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]} break`}>{translateInGame("pf_client_seed_tooltip")}</div>
                </div>

                <div className="relative">
                    <h3 className={Styles["section-title"]}>{translateCommon("pf_ header_merge_client_seed")}</h3>
                    <span className={Styles["link-detail"]} onClick={handleOnClickClientSeedInfo}>
                        {translateInGame("pf_provably_fair_details")}
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
                    <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]}`}>{translateInGame("pf_combined_sha512_hash_tooltip")}</div>
                </div>

                <div className="input-group width-full mt-4">
                    <CopyableTextInput value={pfResult?.finalHash} id="combined-sha512-hash" />
                </div>
            </div>

            <button className={`btn-green ${Styles["btn-verify"]}`} onClick={handleOnClickVerification}>
                {translateCommon("pf_button_verify")}
            </button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

export default PFVerifyModal;
