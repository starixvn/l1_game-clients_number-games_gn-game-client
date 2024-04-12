import { FC, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useClickSound, useCommonTranslate, useSNTranslate } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import CopyableTextInput from "../copyable-text-input";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { Section } from "../pf-form-components";

const PFVerifyModal: FC<{
    renderResultBlock: Function;
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
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
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
        AnalyticsHelper.trackFunction({ function: TrackingFunction.PFClientSeeds, action: TrackingAction.Open });
    };

    const handleOnClickVerification = () => {
        clickSound();
        dispatch({ type: GameEventActionType.TOGGLE_PF_VERIFICATION, payload: { isShowPFVerification: true } });
        AnalyticsHelper.trackFunction({
            function: TrackingFunction.PFVerify,
            action: TrackingAction.Click,
        });
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className="result-block">{renderResultBlock(pfResult)}</div>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_server_seed_sha256")}>
                    <div className="input-group width-full">
                        <CopyableTextInput value={pfResult?.serverSeedHash} id="server-seed-sha256" />
                    </div>
                </Section>
                <Section title={translateCommon("pf_header_server_seed")}>
                    <div className="input-group width-full">
                        <CopyableTextInput value={pfResult?.serverSeed} id="server-seed" />
                    </div>
                </Section>
            </ClientSeedForm>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_client_seed")}>
                    <div className={Styles["tooltip-container"]}>
                        <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} onBlur={handleBlurTooltip}>
                            <span className="icon-info" />
                        </button>
                        <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]} break`}>
                            {translateSNGames("pf_client_seed_tooltip")}
                        </div>
                    </div>
                </Section>
                <div className="relative">
                    <Section title={translateCommon("pf_ header_merge_client_seed")}>
                        <span className={Styles["link-detail"]} onClick={handleOnClickClientSeedInfo}>
                            {translateSNGames("pf_provably_fair_details")}
                        </span>
                    </Section>
                </div>
                <div className="input-group width-full">
                    <CopyableTextInput value={pfResult?.mergeClientSeed} id="merge-client-seed" />
                </div>
            </ClientSeedForm>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_combined_sha512_hash")}>
                    <div className={Styles["tooltip-container"]}>
                        <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} onBlur={handleBlurTooltip}>
                            <span className="icon-info" />
                        </button>
                        <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]}`}>
                            {translateSNGames("pf_combined_sha512_hash_tooltip")}
                        </div>
                    </div>
                </Section>
                <div className="input-group width-full mt-4">
                    <CopyableTextInput value={pfResult?.finalHash} id="combined-sha512-hash" />
                </div>
            </ClientSeedForm>
            <button className={`btn-green ${Styles["btn-verify"]}`} onClick={handleOnClickVerification}>
                {translateCommon("pf_button_verify")}
            </button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

const ClientSeedForm: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className={Styles["client-seed-form"]}>{children}</div>;
};

export default PFVerifyModal;
