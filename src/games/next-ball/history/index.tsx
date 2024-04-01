import { FC } from "react";
import { createPortal } from "react-dom";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import BetHistoryModal from "../../../components/game-components/bet-history";
import BetDetailBase from "../../../components/game-components/bet-history/bet-detail-base";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import { PFVerifyModal } from "../../../components/game-components/provably-fair";
import PFClientSeedInfoModal from "../../../components/game-components/provably-fair/pf-verify/pf-client-seed-info";
import PFVerificationModal from "../../../components/game-components/provably-fair/pf-verify/pf-verification";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import { BetChoice, BetDetailResultBlock, DrawInfoNextBall, produceDataBetDetailRow } from "./bet-detail-result-block";
import renderBetLog from "./bet-log-result-cell";

const NextBallBetHistoryModal: FC = () => {
    const { isShowBetHistory } = useGameStateContext();

    return (
        isShowBetHistory &&
        createPortal(
            <>
                <BetHistoryModal renderBetLog={renderBetLog} />
                <BetDetailModal>
                    <BetDetailBase
                        renderBetDetailResultBlock={(drawInfo: DrawInfoNextBall) => <BetDetailResultBlock drawInfo={drawInfo} />}
                        produceDataBetDetailRow={produceDataBetDetailRow}
                        renderBetChoice={(choice) => <BetChoice choice={choice} />}
                    />
                </BetDetailModal>
                <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
                <PFClientSeedInfoModal fileNameExport={makeFileNameExport} />
                <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
            </>,
            document.getElementById("dashboard")
        )
    );
};

export default NextBallBetHistoryModal;
