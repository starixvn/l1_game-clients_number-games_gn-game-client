import { FC } from "react";
import BetDetailBase from "../../../components/game-components/bet-history/bet-detail-base";
import BetDetailModal from "../../../components/game-components/bet-history/bet-detail-modal";
import { PFVerifyModal } from "../../../components/game-components/provably-fair";
import PFClientSeedInfoModal from "../../../components/game-components/provably-fair/pf-verify/pf-client-seed-info-modal";
import PFVerificationModal from "../../../components/game-components/provably-fair/pf-verify/pf-verification-modal";
import { PFVerification, makeFileNameExport, renderPFVerifyResultBlock } from "../provably-fair";
import { BetChoice, BetDetailResultBlock, DrawInfoSeBall, produceDataBetDetailRow } from "./bet-detail-result-block";
import BetHistoryBase from "../../../components/game-components/bet-history/bet-history-base";
import BetLogResultCell from "./bet-log-result-cell";
import BetHistoryModalBase from "../../../components/game-components/bet-history/bet-history-modal-base";

const SeBallBetHistoryModal: FC = () => {
    return (
        <>
            <BetHistoryModalBase>
                <BetHistoryBase isTurnBase={false} renderBetLogResult={(result) => <BetLogResultCell result={result} />} />
            </BetHistoryModalBase>
            <BetDetailModal>
                <BetDetailBase
                    isTurnBase={false}
                    renderBetDetailResultBlock={(drawInfo: DrawInfoSeBall) => <BetDetailResultBlock drawInfo={drawInfo} />}
                    produceDataBetDetailRow={produceDataBetDetailRow}
                    renderBetChoice={(choice) => <BetChoice choice={choice} />}
                />
            </BetDetailModal>
            <PFVerifyModal renderResultBlock={renderPFVerifyResultBlock}></PFVerifyModal>
            <PFClientSeedInfoModal fileNameExport={makeFileNameExport} />
            <PFVerificationModal>{<PFVerification />}</PFVerificationModal>
        </>
    );
};

export default SeBallBetHistoryModal;
