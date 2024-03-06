import { FC } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";
import { useCommonTranslate } from "../../../_shared/react-hooks";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";

const PFSettingModal: FC = () => {
    const { isShowPFSetting } = useGameStateContext();
    const { t: translateCommon } = useCommonTranslate();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: GameEventActionType.TOGGLE_PF_SETTING, payload: { isShowPFSetting: false } });
    };

    return (
        isShowPFSetting && (
            <ModalContainer title={translateCommon("pf_title_provably_fair_settings")} isOpen={true} onCloseModal={handleCloseModal} />
        )
    );
};

export default PFSettingModal;
