import { formatDate } from "../../../_shared/helpers";

const makeFileNameExport = (drawId: number) => {
    return `DRAW_${drawId}_${formatDate(new Date(), "yyyyMMdd")}.csv`;
};

export { makeFileNameExport };
