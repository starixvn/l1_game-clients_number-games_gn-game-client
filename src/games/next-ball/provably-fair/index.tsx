import { formatDate } from "../../../_shared/helpers";
import PFVerification from "./pf-verification";
import renderPFVerifyResultBlock from "./pf-verify-result-block";

const makeFileNameExport = (drawId: number) => {
    return `DRAW_${drawId}_${formatDate(new Date(), "ddMMyyyy")}.csv`;
};

export { renderPFVerifyResultBlock, PFVerification, makeFileNameExport };
