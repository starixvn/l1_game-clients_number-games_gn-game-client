import { FC, useEffect, useRef, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import Styles from "./pf-setting.module.scss";
import { ButtonPFGuide } from "../pf-guide";
import { useGameContext } from "../../../_shared/react-contexts";

const NUMBER_VALUES = "0123456789";

const PFSettingModal: FC = () => {
    const { isShowPFSetting } = useGameStateContext();
    const { t: translateCommon } = useCommonTranslate();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: GameEventActionType.TOGGLE_PF_SETTING, payload: { isShowPFSetting: false } });
    };

    return (
        isShowPFSetting && (
            <ModalContainer
                id="pf-setting"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_provably_fair_settings").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={true}
                onCloseModal={handleCloseModal}
            >
                <PFSetting />
            </ModalContainer>
        )
    );
};

const PFSetting: FC = () => {
    const randomRadio = useRef<HTMLInputElement>();
    const randomSeed = useRef<HTMLInputElement>();
    const manualRadio = useRef<HTMLInputElement>();
    const manualSeed = useRef<HTMLInputElement>();
    const { pfSetting, ownBets } = useGameStateContext();
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isCopySuccess, setIsCopySuccess] = useState<boolean>(false);
    const [isManualMode, setIsManualMode] = useState<boolean>(pfSetting?.useManualClientSeed || false);
    const { t: translateCommon } = useCommonTranslate();
    const { gameName } = useGameContext();
    const { t: translateBacBall } = useTranslator([gameName]);
    const dispatch = useGameStatesDispatch();
    const handleOnKeyPress = (event: any) => {
        const chr = event.key;
        if ((NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8) || (event.target.value.length >= 4 && event.which !== 8)) {
            event.preventDefault();
        }
    };

    const handlePaste = (event: any) => {
        const value = event.target.value;
        const numberRegex = /^\d+$/;
        if (value.length > 4 || !numberRegex.test(value)) {
            event.preventDefault();
        }
    };

    useEffect(() => {
        manualSeed.current.addEventListener("blur", (event: any) => {
            if (event.target.value.length == 0) {
                event.target.value = randomSeed.current.value;
            }

            dispatch({
                type: GameEventActionType.UPDATE_PF_SETTING,
                payload: {
                    pfSetting: {
                        manualClientSeed: event.target.value,
                    },
                },
            });
        });
    }, []);

    useEffect(() => {
        if (isManualMode) {
            if (!isFirstLoad) {
                manualSeed.current.focus();
            }
            setIsFirstLoad(false);
        } else {
            manualSeed.current.value = "";
        }
    }, [isManualMode]);

    const handleCopyServerSeedHash = () => {
        const serverSeed = document.getElementById("server-seed-hash") as HTMLInputElement;
        navigator.clipboard.writeText(serverSeed.value);
        setIsCopySuccess(true);
        setTimeout(() => {
            setIsCopySuccess(false);
        }, 500);
    };

    const handleCheckRadio = () => {
        setIsManualMode(!isManualMode);
        setIsFirstLoad(false);
        if (manualRadio.current.checked) {
            manualSeed.current.value = randomSeed.current.value;
            dispatch({
                type: GameEventActionType.UPDATE_PF_SETTING,
                payload: {
                    pfSetting: {
                        useManualClientSeed: true,
                    },
                },
            });
        } else {
            dispatch({
                type: GameEventActionType.UPDATE_PF_SETTING,
                payload: {
                    pfSetting: {
                        useManualClientSeed: false,
                        manualClientSeed: undefined,
                    },
                },
            });
        }
    };

    return (
        <div className={Styles["pf-setting-container"]}>
            <div>
                <ul>
                    <li>{translateBacBall("pf_settings_para_1")}</li>
                    <li>{translateCommon("pf_settings_para_2")}</li>
                </ul>
            </div>
            <h3 className={Styles["section-title"]}>{translateCommon("pf_header_client_seed")}</h3>
            <div className={Styles["client-seed-form"]}>
                {Object.keys(ownBets).length > 0 && <div className={Styles["form-overlay"]}></div>}
                <div className={Styles["client-seed-options"]}>
                    <div className={Styles["client-seed-option"]}>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                ref={randomRadio}
                                type="radio"
                                id="random-seed"
                                name="client-seed"
                                checked={!isManualMode}
                                value={pfSetting.randomClientSeed}
                                onChange={handleCheckRadio}
                            />
                            <label className="form-check-label" htmlFor="random-seed">
                                {translateCommon("pf_client_seed_para_4")}
                            </label>
                        </div>

                        <input
                            className={"form-control" + (isManualMode ? "" : " checked")}
                            ref={randomSeed}
                            type="text"
                            id="random-client-seed"
                            value={pfSetting.randomClientSeed}
                            readOnly={true}
                            disabled={isManualMode}
                        />
                    </div>
                    <div className={Styles["client-seed-option"]}>
                        <div className="form-check">
                            <input
                                ref={manualRadio}
                                type="radio"
                                id="manual-seed"
                                name="client-seed"
                                checked={isManualMode}
                                onChange={handleCheckRadio}
                                className="form-check-input"
                            />
                            <label className={`form-check-label ${Styles["form-check-label"]}`} htmlFor="manual-seed">
                                <div className={Styles["form-check-label-note"]}>
                                    {`${translateCommon("pf_client_seed_para_3")}`} <br /> (0 - 9999)
                                </div>
                            </label>
                        </div>

                        <input
                            className={"form-control" + (isManualMode ? " checked" : "")}
                            id="manual-client-seed"
                            ref={manualSeed}
                            type="text"
                            inputMode="numeric"
                            onKeyDown={handleOnKeyPress}
                            onPaste={handlePaste}
                            disabled={!isManualMode}
                            defaultValue={pfSetting?.manualClientSeed ?? ""}
                        />
                    </div>
                </div>
            </div>

            <h3 className={Styles["section-title"]}>{translateCommon("pf_header_server_seed_sha256")}</h3>
            <div className={Styles["client-seed-form"]}>
                <div className="input-group width-full">
                    <input id="server-seed-hash" className="form-control" value={pfSetting?.serverSeedHash} readOnly />
                    <button className={Styles["copy-btn"]} onClick={handleCopyServerSeedHash}>
                        <span className="icon-copy" />
                    </button>
                    {isCopySuccess && <div className={Styles["copy-success"]}>{translateCommon("pf_copy_successfully ")}</div>}
                </div>
                {Object.keys(ownBets).length > 0 && <div className={Styles["pf-note"]}>{translateCommon("pf_client_seed_para_1")}</div>}
            </div>
        </div>
    );
};

export default PFSettingModal;
