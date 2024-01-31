import { Round } from "../../../../types";

export type Props<R, S> = {
    roundHistory: Round<R, S>[];
    getDotDetails: (round: R, roundId: number) => void;
    gameState: number;
};
