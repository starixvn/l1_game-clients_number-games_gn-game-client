import { RoundState } from "../../game-base/type";

export enum HighlightType {
    None,
    Background,
}

export type Props = {
    choice: string;
    odd: number;
    children: React.ReactNode;
    isHighlight: boolean;
    isDisplayOdd?: boolean;
    roundState: RoundState;
    isShowWinningEffect: boolean;
    isShowPoolStake?: boolean;
    isShowTooltip?: boolean;
    tooltipMessage?: string;
};
