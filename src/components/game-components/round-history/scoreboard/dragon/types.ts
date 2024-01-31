import { Round } from "../../../../game-base/type";

export interface Props<R, S> {
    roundHistory: Round<R, S>[];
    dotDetails?: DotDetails;
    getRoundValue?: Function;
    isShowBlink?: boolean;
}

interface DotDetails {
    getDotDetails?: Function;
    conditionChangeDot?: Function;
    translateDotTextMapping?: object;
    choice?: string[];
}
