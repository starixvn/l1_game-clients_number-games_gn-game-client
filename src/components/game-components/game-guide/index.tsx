import { FC } from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ModalContainer from "../modal-container";

const GameGuideModal: FC = () => {
    const { isShowGameGuide } = useGameStateContext();
    const dispatch = useGameStatesDispatch();

    const handleCloseModal = () => {
        dispatch({ type: "TOGGLE_GAME_GUIDE", payload: { isShowGameGuide: false } });
    };

    return (
        isShowGameGuide && <ModalContainer isOpen={true} onCloseModal={handleCloseModal} title={"Game Guide"}></ModalContainer>
    );
};

export default GameGuideModal;
