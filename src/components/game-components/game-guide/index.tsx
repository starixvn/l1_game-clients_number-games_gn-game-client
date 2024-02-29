import { FC } from "react";
import BaseModal from "../base-modal";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";

const GameGuideModal: FC = () => {
    const { isShowGameGuide } = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: "TOGGLE_GAME_GUIDE", payload: { isShowGameGuide: false } });
    };

    return <BaseModal isOpen={isShowGameGuide} onCloseModal={handleCloseModal} title={"Game Guide"}></BaseModal>;
};

export default GameGuideModal;
