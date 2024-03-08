import { FC, memo, useEffect, useMemo, useState } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameContext } from "../../../_shared/react-contexts";
import Styles from "./pf-setting.module.scss";

const PF_SOCKET_MESSAGE = "pf";

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
    const { provablyFairData } = useGameStateContext();
    const [randomSeed, setRandomSeed] = useState<number>(null);
    const { t: translateCommon } = useCommonTranslate();

    const handleCopyServerSeedHash = () => {
        let serverSeed = document.getElementById("server-seed-hash") as HTMLInputElement;
        navigator.clipboard.writeText(serverSeed.value);
    };

    useEffect(() => {
        setRandomSeed(Math.floor(Math.random() * 75) + 1);
    }, []);

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
                <div className="pf-setting-seed-para">
                    <div className={Styles["client-seed-option"]}>
                        <div style={{ width: "30%" }}>
                            <input type="radio" id="random-seed" name="client-seed" defaultChecked />
                            <label htmlFor="random-seed">{translateCommon("pf_client_seed_para_4")}</label>
                        </div>
                        <input type="text" id="clien-seed" value={randomSeed} readOnly={true} />
                    </div>
                    <div className={Styles["client-seed-option"]}>
                        <div style={{ width: "30%" }}>
                            <input type="radio" id="manual-seed" name="client-seed" />
                            <label htmlFor="manual-seed">{`${translateCommon("pf_client_seed_para_3")}`}</label>
                        </div>
                        <input type="text" />
                    </div>
                </div>
            </div>
            <div className="pf-setting-seed">
                <h3>{translateCommon("pf_header_server_seed")}</h3>
                <div className={Styles["server-seed-field"]}>
                    <input id="server-seed-hash" className={Styles["server-seed-hash"]} value={provablyFairData?.serverSeedHash} readOnly />
                    <button onClick={handleCopyServerSeedHash}>Copy</button>
                </div>
            </div>
        </div>
    );
};

export default PFSettingModal;
