import { FC } from "react";
import { Socket } from "socket.io-client";
import { createPortal } from "react-dom";
import BetHistoryModal from "../../../components/game-components/bet-history";
import renderBetHistory from "./bet-log";
import renderBetDetail from "./bet-log-detail";


export const BacBallBetHistoryBlock: FC<{ socket: Socket }> = ({ socket }) => {
    return createPortal(
                        <BetHistoryModal
                        socket={socket}
                        renderBetHistoryTable={renderBetHistory}
                        renderBetDetail={renderBetDetail}
                    />, document.getElementById("dashboard")
                    )
};