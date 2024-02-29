import { FC } from "react";
import { createPortal } from "react-dom";
import BetHistoryModal from "../../../components/game-components/bet-history";
import renderBetLog from "./bet-log";
import renderBetLogDetail from "./bet-log-detail";

export const BacBallBetHistoryModal: FC = () => {
    return createPortal(
        <BetHistoryModal renderBetLog={renderBetLog} renderBetLogDetail={renderBetLogDetail} />,
        document.getElementById("dashboard")
    );
};
