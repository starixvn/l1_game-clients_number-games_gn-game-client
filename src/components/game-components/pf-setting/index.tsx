import { FC, useEffect, useRef, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import Styles from "./pf-setting.module.scss";

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
            <ModalContainer title={translateCommon("pf_title_provably_fair_settings")} isOpen={true} onCloseModal={handleCloseModal}>
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
    const [isManualMode, setIsManualMode] = useState<boolean>(pfSetting?.useManualClientSeed || false);
    const { t: translateCommon } = useCommonTranslate();
    const dispatch = useGameStatesDispatch();
    const handleOnKeyPress = (event: any) => {
        const chr = String.fromCharCode(event.which);
        if ((NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8) || (event.target.value.length >= 4 && event.which !== 8)) {
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
            <button className={Styles["btn-pf-guide"]}>
                <span className="icon-guide" />
            </button>
            <div>
                <ul>
                    <li>{translateCommon("pf_settings_para_1")}</li>
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
                            className="form-control"
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
                            <label className="form-check-label" htmlFor="manual-seed">{`${translateCommon(
                                "pf_client_seed_para_3"
                            )}`}</label>
                        </div>

                        <input
                            className="form-control"
                            id="manual-client-seed"
                            ref={manualSeed}
                            type="text"
                            inputMode="numeric"
                            onKeyDown={handleOnKeyPress}
                            disabled={!isManualMode}
                            defaultValue={pfSetting?.manualClientSeed ?? ""}
                        />
                    </div>
                </div>
            </div>

            <h3 className={Styles["section-title"]}>{translateCommon("pf_header_server_seed")}</h3>
            <div className={Styles["client-seed-form"]}>
                <div className="input-group width-full">
                    <input id="server-seed-hash" className="form-control" value={pfSetting?.serverSeedHash} readOnly />
                    <button className={Styles["copy-btn"]} onClick={handleCopyServerSeedHash}>
                        <span className="icon-copy" />
                    </button>
                </div>
                {Object.keys(ownBets).length > 0 && <div className={Styles["pf-note"]}>{translateCommon("pf_client_seed_para_1")}</div>}
            </div>
        </div>
    );
};

export default PFSettingModal;
