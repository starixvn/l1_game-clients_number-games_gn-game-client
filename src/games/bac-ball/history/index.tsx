import { FC } from "react";
import { createPortal } from "react-dom";
import BetHistoryModal from "../../../components/game-components/bet-history";
import renderBetLog from "./bet-log";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import BetDetail from "./bet-detail";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import { PFVerifyModal } from "../../../components/game-components/provably-fair";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import PFClientSeedInfoModal from "../../../components/game-components/provably-fair/pf-verify/pf-client-seed-info";
import PFVerificationModal from "../../../components/game-components/provably-fair/pf-verify/pf-verification";

export const BacBallBetHistoryModal: FC = () => {
    const { isShowBetHistory } = useGameStateContext();

    return (
        isShowBetHistory &&
        createPortal(
            <>
                <BetHistoryModal renderBetLog={renderBetLog} />
                <BetDetailModal>
                    <BetDetail />
                </BetDetailModal>
                <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
                <PFClientSeedInfoModal fileNameExport={makeFileNameExport} />
                <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
            </>,
            document.getElementById("dashboard")
        )
    );
};
