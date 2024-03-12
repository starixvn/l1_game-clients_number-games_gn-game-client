import { FC, useEffect, useRef, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import Styles from "./pf-setting.module.scss";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { PFSettingData } from "../../game-base/type";
import { useAuthContext, useGameContext } from "../../../_shared/react-contexts";
import { messageEventType } from "../../game-base/handlers";

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
    const { authorizeInfo } = useAuthContext();
    const uid = authorizeInfo.user.UID;
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const provablyFairData = StorageHelper.get<PFSettingData>(`${localStorageKeys.pfSetting}-${uid}`);
    const [isManualMode, setIsManualMode] = useState<boolean>(provablyFairData?.useManualClientSeed || false);
    const { ownBets } = useGameStateContext();
    const { t: translateCommon } = useCommonTranslate();
    const { gameMessageHandler } = useGameContext();
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

            gameMessageHandler.broadcastGameEvent({
                [messageEventType.UPDATE_PF_SETTING]: {
                    data: {
                        manualClientSeed: event.target.value,
                    },
                },
            });
        });
    }, []);

    useEffect(() => {
        console.log("Change mode", manualRadio.current.checked);
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
            gameMessageHandler.broadcastGameEvent({
                [messageEventType.UPDATE_PF_SETTING]: {
                    data: {
                        useManualClientSeed: true,
                    },
                },
            });
        } else {
            gameMessageHandler.broadcastGameEvent({
                [messageEventType.UPDATE_PF_SETTING]: {
                    data: {
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
                    <li>{translateCommon("pf_settings_para_1")}</li>
                    <li>{translateCommon("pf_settings_para_2")}</li>
                </ul>
            </div>
            <h3>{translateCommon("pf_header_client_seed")}</h3>
            <div className={Styles["client-seed-form"]}>
                {Object.keys(ownBets).length > 0 && <div className={Styles["form-overlay"]}></div>}
                <div className={Styles["client-seed-options"]}>
                    <div className={Styles["client-seed-option"]}>
                        <div style={{ width: "30%" }}>
                            <input
                                ref={randomRadio}
                                type="radio"
                                id="random-seed"
                                name="client-seed"
                                checked={!isManualMode}
                                value={provablyFairData.randomClientSeed}
                                onChange={handleCheckRadio}
                            />
                            <label htmlFor="random-seed">{translateCommon("pf_client_seed_para_4")}</label>
                        </div>
                        <div>
                            <input
                                ref={randomSeed}
                                type="text"
                                id="random-client-seed"
                                value={provablyFairData.randomClientSeed}
                                readOnly={true}
                                disabled={isManualMode}
                            />
                        </div>
                    </div>
                    <div className={Styles["client-seed-option"]}>
                        <div style={{ width: "30%" }}>
                            <input
                                ref={manualRadio}
                                type="radio"
                                id="manual-seed"
                                name="client-seed"
                                checked={isManualMode}
                                onChange={handleCheckRadio}
                            />
                            <label htmlFor="manual-seed">{`${translateCommon("pf_client_seed_para_3")}`}</label>
                        </div>
                        <div className={Styles["manual-seed-input"]}>
                            <input
                                id="manual-client-seed"
                                ref={manualSeed}
                                type="text"
                                inputMode="numeric"
                                onKeyDown={handleOnKeyPress}
                                disabled={!isManualMode}
                                defaultValue={provablyFairData?.manualClientSeed ?? ""}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="pf-setting-seed">
                <h3>{translateCommon("pf_header_server_seed")}</h3>
                <div className={Styles["server-seed-field"]}>
                    <input id="server-seed-hash" className={Styles["server-seed-hash"]} value={provablyFairData?.serverSeedHash} readOnly />
                    <button onClick={handleCopyServerSeedHash}>Copy</button>
                </div>
                {Object.keys(ownBets).length > 0 && (
                    <div style={{ padding: "0rem 2rem", textAlign: "center", color: "yellow" }}>
                        {translateCommon("pf_client_seed_para_1")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PFSettingModal;
