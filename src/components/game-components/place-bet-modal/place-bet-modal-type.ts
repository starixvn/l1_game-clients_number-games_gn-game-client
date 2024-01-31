import { Position } from "../../game-base/type";

type BetChoiceInfo = {
    gameName: string;
    roundId: number;
    betChoice: string;
    odd: number;
};

export type PlaceBetModalProps = {
    isOpen: boolean;
    onPlaceBet: (betChoice: string, amount: number, betPosition: Position) => void;
    betChoiceInfo: BetChoiceInfo;
    onCloseModal: Function;
    betContainerPosition?: any;
    gameBaseContainerRef?: any;
    gameHeaderRef?: any;
    removeBetChoiceFocus?: Function;
    betOptionElement?: HTMLElement;
    betChoiceElement?: HTMLElement;
};
