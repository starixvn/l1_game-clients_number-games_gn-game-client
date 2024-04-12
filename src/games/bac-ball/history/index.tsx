import { FC } from "react";
import { createPortal } from "react-dom";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import BetHistoryModal from "../../../components/game-components/bet-history";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import { PFVerifyModal } from "../../../components/game-components/provably-fair";
import PFClientSeedInfoModal from "../../../components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal";
import PFVerificationModal from "../../../components/game-components/provably-fair/pf-verify/pf-verification-modal";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import BetDetail from "./bet-detail";
import renderBetLog from "./bet-log";

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

export default BacBallBetHistoryModal;
