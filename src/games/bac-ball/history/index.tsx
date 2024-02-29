import { FC } from "react";
import { createPortal } from "react-dom";
import BetHistoryModal from "../../../components/game-components/bet-history";
import renderBetLog from "./bet-log";
import renderBetLogDetail from "./bet-log-detail";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export const BacBallBetHistoryModal: FC = () => {
    const { isShowBetHistory } = useGameStateContext();

    return (
        isShowBetHistory &&
        createPortal(
            <BetHistoryModal renderBetLog={renderBetLog} renderBetLogDetail={renderBetLogDetail} />,
            document.getElementById("dashboard")
        )
    );
};
