import { Round } from "../../../../game-base/type";

export type Props<R, S> = {
    roundHistory: Round<R, S>[];
    getDotDetails: (round: R, roundId: number) => void;
    roundState: number;
};
