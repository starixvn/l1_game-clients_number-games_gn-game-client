import { RoundState, Round } from "../../../game-base/type";

export type PropsDot<R, S> = {
    children: React.ReactNode;
    renderRoundDetail: JSX.Element;
    targetName: string;
    gameState: RoundState;
};

export type Props<R, S> = {
    roundHistory: Round<R, S>[];
    gameState: number;
    renderRoundDetail: (round: Round<R, S>, t: Function) => JSX.Element;
    renderGameDot: (round: Round<R, S>, isShowBlink: boolean, index: number, numberOfItems: number) => JSX.Element;
};
