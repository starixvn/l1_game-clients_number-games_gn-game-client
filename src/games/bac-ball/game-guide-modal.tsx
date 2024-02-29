import { createPortal } from "react-dom";
import GameGuideModal from "../../components/game-components/game-guide";
import { FC } from "react";

const BacBallGameGuideModal: FC = () => {
    return createPortal(
        <GameGuideModal />, document.getElementById("dashboard")
    )
};

export default BacBallGameGuideModal;